/**
 * Error Utilities
 * Provides standardized error handling functions to eliminate code duplication
 */

const { logger } = require('./logger');

/**
 * Create a standardized service error
 * @param {string} methodName - Name of the method where error occurred
 * @param {Error} originalError - The original error object
 * @param {string} context - Additional context about the error
 * @returns {Error} Standardized service error
 */
const createServiceError = (methodName, originalError, context = '') => {
  const message = context 
    ? `Service error in ${methodName}: ${context} - ${originalError.message}`
    : `Service error in ${methodName}: ${originalError.message}`;
  
  logger.error(`Service error in ${methodName}`, {
    error: originalError.message,
    context,
    stack: originalError.stack
  });
  
  return new Error(message);
};

/**
 * Create a standardized database error
 * @param {string} methodName - Name of the method where error occurred
 * @param {Error} originalError - The original error object
 * @param {string} context - Additional context about the error
 * @returns {Error} Standardized database error
 */
const createDatabaseError = (methodName, originalError, context = '') => {
  const message = context 
    ? `Database error in ${methodName}: ${context} - ${originalError.message}`
    : `Database error in ${methodName}: ${originalError.message}`;
  
  logger.error(`Database error in ${methodName}`, {
    error: originalError.message,
    context,
    stack: originalError.stack
  });
  
  return new Error(message);
};

/**
 * Create a standardized validation error
 * @param {string} methodName - Name of the method where error occurred
 * @param {Error} originalError - The original error object
 * @param {string} field - Field that failed validation
 * @param {any} value - Value that failed validation
 * @returns {Error} Standardized validation error
 */
const createValidationError = (methodName, originalError, field = '', value = '') => {
  const message = field 
    ? `Validation error in ${methodName}: ${field} - ${originalError.message}`
    : `Validation error in ${methodName}: ${originalError.message}`;
  
  logger.error(`Validation error in ${methodName}`, {
    error: originalError.message,
    field,
    value,
    stack: originalError.stack
  });
  
  return new Error(message);
};

/**
 * Create a standardized controller error
 * @param {string} methodName - Name of the method where error occurred
 * @param {Error} originalError - The original error object
 * @param {string} context - Additional context about the error
 * @returns {Error} Standardized controller error
 */
const createControllerError = (methodName, originalError, context = '') => {
  const message = context 
    ? `Controller error in ${methodName}: ${context} - ${originalError.message}`
    : `Controller error in ${methodName}: ${originalError.message}`;
  
  logger.error(`Controller error in ${methodName}`, {
    error: originalError.message,
    context,
    stack: originalError.stack
  });
  
  return new Error(message);
};

/**
 * Wrapper function for service methods with standardized error handling
 * @param {Function} serviceMethod - The service method to wrap
 * @param {string} methodName - Name of the method for error messages
 * @param {string} context - Additional context for error messages
 * @returns {Function} Wrapped function with error handling
 */
const withServiceErrorHandling = (serviceMethod, methodName, context = '') => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      throw createServiceError(methodName, error, context);
    }
  };
};

/**
 * Wrapper function for repository methods with standardized error handling
 * @param {Function} repositoryMethod - The repository method to wrap
 * @param {string} methodName - Name of the method for error messages
 * @param {string} context - Additional context for error messages
 * @returns {Function} Wrapped function with error handling
 */
const withDatabaseErrorHandling = (repositoryMethod, methodName, context = '') => {
  return async (...args) => {
    try {
      return await repositoryMethod(...args);
    } catch (error) {
      throw createDatabaseError(methodName, error, context);
    }
  };
};

/**
 * Wrapper function for controller methods with standardized error handling
 * @param {Function} controllerMethod - The controller method to wrap
 * @param {string} methodName - Name of the method for error messages
 * @param {string} context - Additional context for error messages
 * @returns {Function} Wrapped function with error handling
 */
const withControllerErrorHandling = (controllerMethod, methodName, context = '') => {
  return async (...args) => {
    try {
      return await controllerMethod(...args);
    } catch (error) {
      throw createControllerError(methodName, error, context);
    }
  };
};

/**
 * Handle async errors in route handlers
 * @param {Function} routeHandler - The route handler function
 * @param {string} routeName - Name of the route for error messages
 * @returns {Function} Wrapped route handler with error handling
 */
const withRouteErrorHandling = (routeHandler, routeName) => {
  return async (req, res, next) => {
    try {
      await routeHandler(req, res, next);
    } catch (error) {
      logger.error(`Route error in ${routeName}`, {
        error: error.message,
        url: req.originalUrl,
        method: req.method,
        stack: error.stack
      });
      next(error);
    }
  };
};

module.exports = {
  createServiceError,
  createDatabaseError,
  createValidationError,
  createControllerError,
  withServiceErrorHandling,
  withDatabaseErrorHandling,
  withControllerErrorHandling,
  withRouteErrorHandling
}; 