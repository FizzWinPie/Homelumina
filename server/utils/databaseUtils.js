const db = require('../config/database');

/**
 * Database Utilities
 * Provides common database operations to eliminate code duplication
 */
class DatabaseUtils {
  /**
   * Execute a database query with standardized error handling
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} methodName - Name of the calling method (for error messages)
   * @returns {Promise<Array>} Query results
   */
  static async executeQuery(query, params = [], methodName = 'unknown') {
    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in ${methodName}: ${error.message}`);
    }
  }

  /**
   * Execute a database query and return first row
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} methodName - Name of the calling method (for error messages)
   * @returns {Promise<Object|null>} First row or null
   */
  static async executeQuerySingle(query, params = [], methodName = 'unknown') {
    try {
      const result = await db.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Database error in ${methodName}: ${error.message}`);
    }
  }

  /**
   * Execute a database query and return count
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} methodName - Name of the calling method (for error messages)
   * @returns {Promise<number>} Count value
   */
  static async executeQueryCount(query, params = [], methodName = 'unknown') {
    try {
      const result = await db.query(query, params);
      return parseInt(result.rows[0]?.count || 0);
    } catch (error) {
      throw new Error(`Database error in ${methodName}: ${error.message}`);
    }
  }

  /**
   * Build dynamic WHERE clause with parameters
   * @param {Object} conditions - Object with field names and values
   * @param {number} startIndex - Starting parameter index (default: 1)
   * @returns {Object} { whereClause, params }
   */
  static buildWhereClause(conditions, startIndex = 1) {
    const whereParts = [];
    const params = [];
    let paramIndex = startIndex;

    for (const [field, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          // Already formatted for ILIKE
          whereParts.push(`${field} ILIKE $${paramIndex++}`);
          params.push(value);
        } else if (typeof value === 'string') {
          // String value - use ILIKE for partial matching
          whereParts.push(`${field} ILIKE $${paramIndex++}`);
          params.push(`%${value}%`);
        } else {
          // Exact match for numbers, booleans, etc.
          whereParts.push(`${field} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    return { whereClause, params };
  }

  /**
   * Validate and sanitize limit parameter
   * @param {any} limit - Limit value
   * @param {number} maxLimit - Maximum allowed limit
   * @param {number} defaultLimit - Default limit if not provided
   * @returns {number} Sanitized limit
   */
  static sanitizeLimit(limit, maxLimit = 100, defaultLimit = 10) {
    const numLimit = parseInt(limit);
    if (isNaN(numLimit) || numLimit < 1) {
      return defaultLimit;
    }
    return Math.min(numLimit, maxLimit);
  }

  /**
   * Validate ZIP code format
   * @param {string} zipcode - ZIP code to validate
   * @returns {boolean} True if valid
   */
  static isValidZipcode(zipcode) {
    return /^\d{5}$/.test(zipcode);
  }

  /**
   * Format response with metadata
   * @param {Array} data - Response data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted response
   */
  static formatResponse(data, metadata = {}) {
    return {
      success: true,
      data,
      metadata: {
        count: Array.isArray(data) ? data.length : 1,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }
}

module.exports = DatabaseUtils; 