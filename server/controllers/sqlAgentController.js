const sqlAgentService = require('../services/sqlAgentService');
const ResponseUtils = require('../utils/responseUtils');
const { logger } = require('../utils/logger');

/**
 * SQL Agent Controller
 * Handles POST /api/v1/sql-agent/query: natural language question -> generated SQL, rows, optional summary.
 */
async function handleQuery(req, res) {
  const { question, includeSummary } = req.body ?? {};

  if (question === undefined || question === null) {
    return res.status(400).json(
      ResponseUtils.formatError('question is required', 400, '/api/v1/sql-agent/query', { body: req.body })
    );
  }
  if (typeof question !== 'string') {
    return res.status(400).json(
      ResponseUtils.formatError('question must be a string', 400, '/api/v1/sql-agent/query')
    );
  }
  if (question.trim().length === 0) {
    return res.status(400).json(
      ResponseUtils.formatError('question cannot be empty', 400, '/api/v1/sql-agent/query')
    );
  }
  if (question.length > 500) {
    return res.status(400).json(
      ResponseUtils.formatError('question must be at most 500 characters', 400, '/api/v1/sql-agent/query')
    );
  }

  try {
    const result = await sqlAgentService.generateAndExecute(question.trim(), {
      includeSummary: Boolean(includeSummary)
    });
    return res.json(
      ResponseUtils.formatSuccess(result, { type: 'sql_agent_query' })
    );
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') {
      logger.warn('SQL agent: Gemini API key not configured');
      return res.status(503).json(
        ResponseUtils.formatError('SQL agent is not available (Gemini not configured)', 503, '/api/v1/sql-agent/query')
      );
    }
    if (error.code === 'READ_ONLY_VIOLATION') {
      return res.status(400).json(
        ResponseUtils.formatError(error.message, 400, '/api/v1/sql-agent/query')
      );
    }
    logger.error('SQL agent error', { error: error.message, stack: error.stack });
    return res.status(500).json(
      ResponseUtils.formatError(error.message || 'Internal server error', 500, '/api/v1/sql-agent/query')
    );
  }
}

module.exports = {
  handleQuery
};
