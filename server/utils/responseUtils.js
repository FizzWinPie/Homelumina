/**
 * Response Utilities
 * Provides standardized response formatting to eliminate code duplication
 */
class ResponseUtils {
  /**
   * Format successful response with data
   * @param {any} data - Response data
   * @param {string|Object} typeOrMetadata - Type string or metadata object
   * @returns {Object} Formatted success response
   */
  static formatSuccess(data, typeOrMetadata = {}) {
    const response = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    // If typeOrMetadata is a string, treat it as type
    if (typeof typeOrMetadata === 'string') {
      response.type = typeOrMetadata;
    } else {
      // Otherwise treat it as metadata
      Object.assign(response, typeOrMetadata);
    }

    return response;
  }

  /**
   * Format successful response with pagination
   * @param {Array} data - Response data
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted paginated response
   */
  static formatPaginatedResponse(data, page = 1, limit = 10, total = 0, metadata = {}) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString(),
      ...metadata
    };
  }

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} path - Request path
   * @param {any} details - Additional error details
   * @returns {Object} Formatted error response
   */
  static formatError(message, statusCode = 500, path = null, details = null) {
    const response = {
      success: false,
      error: message,
      statusCode,
      timestamp: new Date().toISOString()
    };

    if (path) {
      response.path = path;
    }

    if (details) {
      response.details = details;
    }

    return response;
  }

  /**
   * Format validation error response
   * @param {Array} errors - Validation errors
   * @param {string} path - Request path
   * @returns {Object} Formatted validation error response
   */
  static formatValidationError(errors, path = null) {
    return {
      success: false,
      error: 'Validation failed',
      statusCode: 400,
      validationErrors: errors,
      path,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format not found response
   * @param {string} resource - Resource that was not found
   * @param {string} path - Request path
   * @returns {Object} Formatted not found response
   */
  static formatNotFound(resource = 'Resource', path = null) {
    return {
      success: false,
      error: `${resource} not found`,
      statusCode: 404,
      path,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format health check response
   * @param {string} service - Service name
   * @param {string} status - Health status
   * @param {Object} details - Additional health details
   * @returns {Object} Formatted health response
   */
  static formatHealthCheck(service, status = 'healthy', details = {}) {
    return {
      status,
      service,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      ...details
    };
  }

  /**
   * Format API information response
   * @param {string} name - API name
   * @param {string} version - API version
   * @param {Object} endpoints - Available endpoints
   * @returns {Object} Formatted API info response
   */
  static formatApiInfo(name, version, endpoints = {}) {
    return {
      message: `Welcome to ${name}`,
      version,
      documentation: {
        v1: '/api/v1/docs',
        latest: '/api/v1/docs'
      },
      endpoints,
      status: 'operational',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format comparison response
   * @param {Object} comparison - Comparison data
   * @param {string} type - Type of comparison
   * @returns {Object} Formatted comparison response
   */
  static formatComparison(comparison, type = 'comparison') {
    return {
      success: true,
      type,
      comparison,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format statistics response
   * @param {Object} statistics - Statistics data
   * @param {string} entity - Entity the statistics are for
   * @returns {Object} Formatted statistics response
   */
  static formatStatistics(statistics, entity = 'data') {
    return {
      success: true,
      entity,
      statistics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format search response
   * @param {Array} results - Search results
   * @param {string} type - Type of search
   * @param {Object} criteria - Search criteria used
   * @param {number} total - Total results count
   * @returns {Object} Formatted search response
   */
  static formatSearch(results, type = 'search', criteria = {}, total = null) {
    const response = {
      success: true,
      data: results,
      type,
      criteria,
      timestamp: new Date().toISOString()
    };

    if (total !== null) {
      response.total = total;
    }

    return response;
  }

  /**
   * Format search response (legacy method)
   * @param {Array} results - Search results
   * @param {Object} criteria - Search criteria used
   * @param {number} total - Total results count
   * @returns {Object} Formatted search response
   */
  static formatSearchResponse(results, criteria = {}, total = null) {
    return this.formatSearch(results, 'search', criteria, total);
  }

  /**
   * Format database table response
   * @param {Array} tables - Table names
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted table response
   */
  static formatTableResponse(tables, metadata = {}) {
    return {
      success: true,
      data: tables,
      metadata: {
        count: tables.length,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }

  /**
   * Format sample data response
   * @param {Array} data - Sample data
   * @param {string} table - Table name
   * @param {number} limit - Limit used
   * @returns {Object} Formatted sample data response
   */
  static formatSampleDataResponse(data, table, limit) {
    return {
      success: true,
      data,
      metadata: {
        table,
        limit,
        count: data.length,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = ResponseUtils; 