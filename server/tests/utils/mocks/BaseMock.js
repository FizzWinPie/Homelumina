/**
 * Base Mock Class
 * Contains common functionality for all database mock types
 */

const { logger } = require('../../../utils/logger');

class BaseMock {
  constructor() {
    this.queryHistory = [];
    this.customResponses = new Map();
    this.shouldError = false;
    this.errorToThrow = null;
    this.testMocks = new Map();
  }

  /**
   * Record query history
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   */
  recordQuery(query, params = []) {
    this.queryHistory.push({ 
      query, 
      params, 
      timestamp: new Date() 
    });

    logger.debug('Processing database mock query', { 
      query: query.toLowerCase().substring(0, 100) + '...',
      params: params 
    });
  }

  /**
   * Check if we should throw an error
   * @returns {boolean} True if should throw error
   */
  shouldThrowError() {
    return this.shouldError && this.errorToThrow;
  }

  /**
   * Get error to throw
   * @returns {Error} Error object to throw
   */
  getErrorToThrow() {
    return this.errorToThrow;
  }

  /**
   * Check for custom responses
   * @param {string} query - SQL query
   * @returns {Object|null} Custom response or null
   */
  getCustomResponse(query) {
    for (const [pattern, response] of this.customResponses) {
      let matches = false;
      if (typeof pattern === 'string') {
        matches = query.toLowerCase().includes(pattern.toLowerCase());
      } else if (pattern instanceof RegExp) {
        matches = pattern.test(query);
      }
      
      if (matches) {
        return {
          rows: response.rows || response,
          rowCount: response.rowCount || (Array.isArray(response) ? response.length : 0)
        };
      }
    }
    return null;
  }

  /**
   * Setup custom query response
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {Object|Array} response - Response data
   */
  setupQueryResponse(queryPattern, response) {
    this.customResponses.set(queryPattern, response);
  }

  /**
   * Setup error response
   * @param {Error} error - Error to throw
   */
  setupErrorResponse(error) {
    this.shouldError = true;
    this.errorToThrow = error;
  }

  /**
   * Get test mock for specific pattern
   * @param {string} pattern - Pattern to match
   * @returns {Array|undefined} Test mock data
   */
  getTestMock(pattern) {
    const result = this.testMocks.get(pattern);
    if (typeof logger !== 'undefined') {
      logger.debug(`[MOCK] getTestMock lookup: ${pattern} =>`, result);
      if (result === undefined) {
        const allKeys = Array.from(this.testMocks.keys());
        logger.debug(`[MOCK] getTestMock: pattern '${pattern}' not found. Current keys:`, allKeys);
      }
    }
    return result;
  }

  /**
   * Setup test mock
   * @param {string} pattern - Pattern to match
   * @param {Array} data - Mock data
   */
  setupTestMock(pattern, data) {
    if (typeof logger !== 'undefined') {
      logger.debug(`[MOCK] setupTestMock: ${pattern} =>`, { data });
    }
    // Store a shallow copy if array, but do NOT wrap in object
    const safeData = Array.isArray(data) ? [...data] : data;
    this.testMocks.set(pattern, safeData);
  }

  /**
   * Reset mock state
   */
  reset() {
    this.queryHistory = [];
    this.customResponses.clear();
    this.testMocks.clear();
    this.shouldError = false;
    this.errorToThrow = null;
    this.shouldThrowError = false;
  }

  /**
   * Get query history
   * @returns {Array} Query history
   */
  getQueryHistory() {
    return [...this.queryHistory];
  }

  /**
   * Clear query history
   */
  clearQueryHistory() {
    this.queryHistory = [];
  }

  /**
   * Verify specific query was called
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {number} times - Expected number of calls
   * @returns {Array} Matching queries
   */
  verifyQuery(queryPattern, times = 1) {
    const matchingQueries = this.queryHistory.filter(entry => {
      if (typeof queryPattern === 'string') {
        return entry.query.toLowerCase().includes(queryPattern.toLowerCase());
      }
      if (queryPattern instanceof RegExp) {
        return queryPattern.test(entry.query);
      }
      return false;
    });

    expect(matchingQueries.length).toBe(times);
    return matchingQueries;
  }

  /**
   * Verify query with parameters
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {Array} expectedParams - Expected parameters
   * @param {number} times - Expected number of calls
   * @returns {Array} Matching queries
   */
  verifyQueryWithParams(queryPattern, expectedParams, times = 1) {
    const matchingQueries = this.queryHistory.filter(entry => {
      const queryMatches = typeof queryPattern === 'string' 
        ? entry.query.toLowerCase().includes(queryPattern.toLowerCase())
        : queryPattern.test(entry.query);
      
      const paramsMatch = JSON.stringify(entry.params) === JSON.stringify(expectedParams);
      
      return queryMatches && paramsMatch;
    });

    expect(matchingQueries.length).toBe(times);
    return matchingQueries;
  }

  /**
   * Extract table name from query
   * @param {string} queryLower - Lowercase query string
   * @returns {string|null} Table name or null
   */
  extractTableName(queryLower) {
    const fromMatch = queryLower.match(/from\s+(\w+)/);
    if (fromMatch) {
      return fromMatch[1];
    }
    
    const joinMatch = queryLower.match(/join\s+(\w+)/);
    if (joinMatch) {
      return joinMatch[1];
    }
    
    return null;
  }

  /**
   * Create success response
   * @param {Array} rows - Response rows
   * @returns {Object} Success response
   */
  createSuccessResponse(rows) {
    return Promise.resolve({
      rows: rows,
      rowCount: rows.length
    });
  }

  /**
   * Create error response
   * @param {Error} error - Error to throw
   * @returns {Promise} Rejected promise
   */
  createErrorResponse(error) {
    return Promise.reject(error);
  }
}

module.exports = BaseMock; 