/**
 * Route Handler Utilities
 * Provides standardized route handler functions to eliminate code duplication
 */

const { logger } = require('./logger');
const ResponseUtils = require('./responseUtils');

/**
 * Create a standardized route handler with logging and response formatting
 * @param {string} routeName - Name of the route for logging
 * @param {Function} controllerMethod - Controller method to call
 * @param {Object} options - Configuration options
 * @returns {Function} Standardized route handler
 */
const createRouteHandler = (routeName, controllerMethod, options = {}) => {
  const {
    logParams = true,
    logResponse = true,
    validateParams = null,
    transformResponse = null,
    errorContext = ''
  } = options;

  return async (req, res) => {
    const startTime = Date.now();
    const params = { ...req.query, ...req.params };
    
    try {
      // Log request start
      if (logParams) {
        logger.info(`Starting ${routeName}`, { 
          params,
          method: req.method,
          url: req.originalUrl
        });
      }

      // Validate parameters if validation function provided
      if (validateParams) {
        const validationResult = validateParams(params);
        if (!validationResult.isValid) {
          return res.status(400).json(ResponseUtils.formatError(
            validationResult.message,
            400,
            req.originalUrl,
            validationResult.details
          ));
        }
      }

      // Call controller method
      const result = await controllerMethod(params);

      // Transform response if transform function provided
      const finalResult = transformResponse ? transformResponse(result, params) : result;

      // Log successful completion
      if (logResponse) {
        const duration = Date.now() - startTime;
        logger.info(`${routeName} completed successfully`, {
          duration: `${duration}ms`,
          count: finalResult.data ? finalResult.data.length : 0,
          hasData: !!finalResult.data
        });
      }

      // Send response
      res.json(finalResult);

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${routeName} failed`, {
        error: error.message,
        duration: `${duration}ms`,
        params,
        stack: error.stack
      });

      // Send error response
      res.status(500).json(ResponseUtils.formatError(
        `Error in ${routeName}: ${error.message}`,
        500,
        req.originalUrl,
        { context: errorContext }
      ));
    }
  };
};

/**
 * Create a simple route handler for basic CRUD operations
 * @param {string} routeName - Name of the route
 * @param {Function} controllerMethod - Controller method to call
 * @returns {Function} Simple route handler
 */
const createSimpleRouteHandler = (routeName, controllerMethod) => {
  return createRouteHandler(routeName, controllerMethod, {
    logParams: true,
    logResponse: true
  });
};

/**
 * Create a route handler with parameter validation
 * @param {string} routeName - Name of the route
 * @param {Function} controllerMethod - Controller method to call
 * @param {Function} validateParams - Parameter validation function
 * @returns {Function} Route handler with validation
 */
const createValidatedRouteHandler = (routeName, controllerMethod, validateParams) => {
  return createRouteHandler(routeName, controllerMethod, {
    logParams: true,
    logResponse: true,
    validateParams
  });
};

/**
 * Create a route handler with response transformation
 * @param {string} routeName - Name of the route
 * @param {Function} controllerMethod - Controller method to call
 * @param {Function} transformResponse - Response transformation function
 * @returns {Function} Route handler with response transformation
 */
const createTransformedRouteHandler = (routeName, controllerMethod, transformResponse) => {
  return createRouteHandler(routeName, controllerMethod, {
    logParams: true,
    logResponse: true,
    transformResponse
  });
};

/**
 * Standard validation functions for common parameters
 */
const validationUtils = {
  /**
   * Validate required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} requiredParams - Array of required parameter names
   * @returns {Object} Validation result
   */
  validateRequired: (params, requiredParams) => {
    for (const param of requiredParams) {
      if (!params[param]) {
        return {
          isValid: false,
          message: `${param} is required`,
          details: { missingParam: param }
        };
      }
    }
    return { isValid: true };
  },

  /**
   * Validate ZIP code format
   * @param {string} zipcode - ZIP code to validate
   * @returns {Object} Validation result
   */
  validateZipcode: (zipcode) => {
    if (!zipcode || zipcode.length !== 5 || !/^\d{5}$/.test(zipcode)) {
      return {
        isValid: false,
        message: 'Invalid ZIP code format. Must be 5 digits.',
        details: { zipcode }
      };
    }
    return { isValid: true };
  },

  /**
   * Validate city name format
   * @param {string} city - City name to validate
   * @returns {Object} Validation result
   */
  validateCity: (city) => {
    if (!city || city.trim().length < 2 || city.trim().length > 100) {
      return {
        isValid: false,
        message: 'Invalid city name format.',
        details: { city }
      };
    }
    return { isValid: true };
  },

  /**
   * Validate numeric range
   * @param {number} value - Value to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} paramName - Parameter name for error message
   * @returns {Object} Validation result
   */
  validateNumericRange: (value, min, max, paramName) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      return {
        isValid: false,
        message: `${paramName} must be a number between ${min} and ${max}`,
        details: { [paramName]: value, min, max }
      };
    }
    return { isValid: true };
  }
};

/**
 * Standard response transformation functions
 */
const responseTransformers = {
  /**
   * Add metadata to response
   * @param {Object} result - Original result
   * @param {Object} params - Request parameters
   * @returns {Object} Transformed result
   */
  addMetadata: (result, params) => {
    return {
      ...result,
      metadata: {
        timestamp: new Date().toISOString(),
        params,
        version: '1.0.0'
      }
    };
  },

  /**
   * Add count to response
   * @param {Object} result - Original result
   * @param {Object} params - Request parameters
   * @returns {Object} Transformed result
   */
  addCount: (result, params) => {
    return {
      ...result,
      count: result.data ? result.data.length : 0,
      params
    };
  },

  /**
   * Add city info to response
   * @param {Object} result - Original result
   * @param {Object} params - Request parameters
   * @returns {Object} Transformed result
   */
  addCityInfo: (result, params) => {
    return {
      ...result,
      city: params.city
    };
  }
};

/**
 * Create a route handler for search operations
 * @param {string} routeName - Name of the route
 * @param {Function} controllerMethod - Controller method to call
 * @returns {Function} Search route handler
 */
const createSearchRouteHandler = (routeName, controllerMethod) => {
  return createRouteHandler(routeName, controllerMethod, {
    logParams: true,
    logResponse: true,
    transformResponse: responseTransformers.addCount
  });
};

/**
 * Create a route handler for analytics operations
 * @param {string} routeName - Name of the route
 * @param {Function} controllerMethod - Controller method to call
 * @returns {Function} Analytics route handler
 */
const createAnalyticsRouteHandler = (routeName, controllerMethod) => {
  return createRouteHandler(routeName, controllerMethod, {
    logParams: true,
    logResponse: true,
    transformResponse: responseTransformers.addMetadata
  });
};

module.exports = {
  createRouteHandler,
  createSimpleRouteHandler,
  createValidatedRouteHandler,
  createTransformedRouteHandler,
  createSearchRouteHandler,
  createAnalyticsRouteHandler,
  validationUtils,
  responseTransformers
}; 