/**
 * Error Handling Middleware
 * Provides centralized error handling and consistent error responses
 * Uses ResponseUtils for standardized response formatting
 */

const ResponseUtils = require('../utils/responseUtils');
const { logger } = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.statusCode = 400;
  }
}

/**
 * Database error handler
 * @param {Error} error - Database error
 * @returns {APIError} Formatted API error
 */
const handleDatabaseError = (error) => {
  // Common PostgreSQL error codes
  const errorMap = {
    '42P01': { message: 'Table does not exist', statusCode: 404 },
    '42703': { message: 'Column does not exist', statusCode: 400 },
    '42804': { message: 'Data type mismatch', statusCode: 400 },
    '23505': { message: 'Duplicate key violation', statusCode: 409 },
    '23503': { message: 'Foreign key violation', statusCode: 400 },
    '28000': { message: 'Authentication failed', statusCode: 401 },
    '3D000': { message: 'Database does not exist', statusCode: 404 },
    '08001': { message: 'Connection failed', statusCode: 503 },
    '08006': { message: 'Connection terminated', statusCode: 503 }
  };

  const errorInfo = errorMap[error.code] || {
    message: 'Database operation failed',
    statusCode: 500
  };

  return new APIError(errorInfo.message, errorInfo.statusCode, {
    originalError: error.message,
    code: error.code
  });
};

/**
 * Validation error handler
 * @param {Error} error - Validation error
 * @returns {APIError} Formatted API error
 */
const handleValidationError = (error) => {
  return new APIError(error.message || 'Validation failed', 400, {
    field: error.field,
    value: error.value,
    message: error.message
  });
};

/**
 * Centralized error handler middleware
 * Uses ResponseUtils for standardized error responses
 */
const errorHandler = (error, req, res, next) => {
  // Set status code for ValidationError
  if (error.name === 'ValidationError') {
    error.statusCode = 400;
  }
  // Set status code for APIError
  if (error.name === 'APIError' && !error.statusCode) {
    error.statusCode = 500;
  }
  // Default to 500 if not set
  const status = error.statusCode || 500;

  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });

  res.status(status).json(
    ResponseUtils.formatError(
      error.message,
      status,
      req.originalUrl,
      error.details || error.field || undefined
    )
  );
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json(ResponseUtils.formatError('Route not found', 404, req.originalUrl));
};

/**
 * Async handler wrapper for Express routes
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((error) => {
    logger.error('Unhandled async error', {
      method: req.method,
      url: req.originalUrl,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json(ResponseUtils.formatError('Internal server error', 500));
  });
};

module.exports = {
  APIError,
  ValidationError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleDatabaseError,
  handleValidationError
}; 