const { GoogleGenAI } = require('@google/genai');
const { getSchemaContext } = require('../schema/sqlAgentSchema');
const DatabaseUtils = require('../utils/databaseUtils');
const { logger } = require('../utils/logger');

const GEMINI_MODEL = process.env.GEMINI_SQL_AGENT_MODEL || 'gemini-2.0-flash';
const MAX_QUESTION_LENGTH = 500;
const SUMMARY_ROW_LIMIT = 20;
const SUMMARY_CHAR_LIMIT = 4000;

/**
 * System prompt: instructs the model to return only a SELECT statement.
 */
const SYSTEM_PROMPT = `You are a SQL expert for PostgreSQL. Your task is to convert a natural language question into a single SQL query.

Rules:
1. Return ONLY one SELECT statement. You may use WITH (CTEs) if needed.
2. Do not include any explanation, markdown, or code fences—only the raw SQL.
3. Use only the tables and columns from the schema provided below. Use lowercase for table and column names.
4. Prefer LIMIT when the question implies "top N" or "first N" (e.g. LIMIT 5 for "top 5").
5. Use standard PostgreSQL syntax (e.g. ILIKE for case-insensitive text match).
6. When querying localmarket, always use DISTINCT on zipcodes or filter by the most recent created_at date to avoid duplicate locations in the results.`;

/**
 * Build user message: schema context + the user's question.
 * @param {string} question - Natural language question
 * @returns {string}
 */
function buildUserMessage(question) {
  const schemaContext = getSchemaContext();
  return `Schema (PostgreSQL tables and columns):

${schemaContext}

User question: ${question}`;
}

/**
 * Extract a single SQL statement from the model's response (handles markdown or extra text).
 * @param {string} content - Raw content from Gemini
 * @returns {string|null} SQL string or null if not found
 */
function extractSqlFromContent(content) {
  if (!content || typeof content !== 'string') return null;
  const trimmed = content.trim();

  // Remove markdown code block if present
  let sql = trimmed;
  const codeBlockMatch = trimmed.match(/```(?:sql)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    sql = codeBlockMatch[1].trim();
  } else {
    // Take from first SELECT or WITH to end of first statement (up to semicolon or end)
    const selectMatch = trimmed.match(/((?:WITH\s+[\s\S]*?|SELECT\s+[\s\S]*?)(?:;\s*|$))/i);
    if (selectMatch) sql = selectMatch[1].replace(/;\s*$/, '').trim();
  }

  return sql.length > 0 ? sql : null;
}

/**
 * Check that the SQL is read-only (only SELECT, optionally WITH).
 * @param {string} sql - SQL string
 * @returns {{ allowed: boolean, reason?: string }}
 */
function isReadOnlyQuery(sql) {
  if (!sql || typeof sql !== 'string') {
    return { allowed: false, reason: 'Empty or invalid SQL' };
  }
  const normalized = sql.trim().toUpperCase();
  const forbidden = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
    'GRANT', 'REVOKE', 'EXECUTE', 'COPY', 'REINDEX', 'VACUUM', 'DISCARD'
  ];
  for (const keyword of forbidden) {
    const regex = new RegExp(`\\b${keyword}\\b`);
    if (regex.test(normalized)) {
      return { allowed: false, reason: `Generated query is not read-only (contains ${keyword})` };
    }
  }
  // Must start with WITH or SELECT (after optional comments/whitespace)
  const withoutComments = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const firstWord = withoutComments.split(/\s+/)[0].toUpperCase();
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    return { allowed: false, reason: 'Generated query must be a SELECT or WITH (CTE) statement only' };
  }
  return { allowed: true };
}

/**
 * Generate SQL from a natural language question using Google Gemini.
 * @param {string} question - User question
 * @returns {Promise<string>} Generated SQL
 */
async function generateSql(question) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('Gemini API key not configured (GEMINI_API_KEY)');
    err.code = 'GEMINI_NOT_CONFIGURED';
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey });
  const userMessage = buildUserMessage(question);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  });

  const content = response?.text ?? (response?.candidates?.[0]?.content?.parts?.[0]?.text);
  const sql = extractSqlFromContent(content);
  if (!sql) {
    logger.warn('SQL agent: no SQL extracted from Gemini response', { questionLength: question.length });
    throw new Error('Could not extract a valid SQL statement from the model response');
  }
  return sql;
}

/**
 * Execute a read-only query (no parameters).
 * @param {string} sql - SELECT statement
 * @returns {Promise<Array>} Query rows
 */
async function executeQuery(sql) {
  return DatabaseUtils.executeQuery(sql, [], 'sqlAgentService.executeQuery');
}

/**
 * Generate a short natural language summary of the results (optional).
 * @param {string} question - Original user question
 * @param {Array<Object>} rows - Result rows
 * @returns {Promise<string>} 1-2 sentence summary
 */
async function generateSummary(question, rows) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !rows || rows.length === 0) return null;

  const sample = rows.slice(0, SUMMARY_ROW_LIMIT);
  const dataStr = JSON.stringify(sample);
  const truncated = dataStr.length > SUMMARY_CHAR_LIMIT
    ? dataStr.slice(0, SUMMARY_CHAR_LIMIT) + '...'
    : dataStr;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Question: ${question}\n\nResult (sample): ${truncated}\n\nSummarize in 1-2 sentences.`,
    config: {
      systemInstruction: 'You summarize query results in 1-2 short sentences. Be factual and concise.',
      temperature: 0.3,
      maxOutputTokens: 150
    }
  });

  const text = response?.text ?? response?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || null;
}

/**
 * Full flow: generate SQL, validate read-only, execute, optionally summarize.
 * @param {string} question - Natural language question
 * @param {{ includeSummary?: boolean }} options
 * @returns {Promise<{ sql: string, rows: Array, summary?: string }>}
 */
async function generateAndExecute(question, options = {}) {
  if (!question || typeof question !== 'string') {
    throw new Error('question is required and must be a non-empty string');
  }
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    throw new Error('question cannot be empty');
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new Error(`question must be at most ${MAX_QUESTION_LENGTH} characters`);
  }

  const sql = await generateSql(trimmed);
  const readOnly = isReadOnlyQuery(sql);
  if (!readOnly.allowed) {
    const err = new Error(readOnly.reason);
    err.code = 'READ_ONLY_VIOLATION';
    throw err;
  }

  const rows = await executeQuery(sql);
  const result = { sql, rows };

  if (options.includeSummary && rows.length > 0) {
    try {
      result.summary = await generateSummary(trimmed, rows);
    } catch (e) {
      logger.warn('SQL agent: summary generation failed', { error: e.message });
    }
  }

  return result;
}

module.exports = {
  buildUserMessage,
  extractSqlFromContent,
  isReadOnlyQuery,
  generateSql,
  executeQuery,
  generateSummary,
  generateAndExecute
};
