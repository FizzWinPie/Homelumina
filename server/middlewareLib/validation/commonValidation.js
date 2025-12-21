/**
 * Common Validation Middleware
 * Contains validation functions shared across multiple services
 */

const { ValidationError } = require('../errorHandler');
const {
  isValidZipcode,
  isValidCity,
  isValidState,
  isValidNumericRange,
  isValidLimit,
  isValidPriceRange,
  sanitizeString,
  sanitizeNumber
} = require('../../utils/validationUtils');
const { logger } = require('../../utils/logger');

/**
 * Generic numeric range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} minField - Name of minimum field in query
 * @param {string} maxField - Name of maximum field in query
 * @param {number} minValue - Minimum allowed value
 * @param {number} maxValue - Maximum allowed value
 * @param {string} fieldName - Human readable field name for error messages
 * @param {string} source - Source of parameters ('query' or 'params')
 */
const validateNumericRange = (req, res, next, minField, maxField, minValue, maxValue, fieldName, source = 'query') => {
  const sourceObj = req[source];
  const min = sourceObj[minField];
  const max = sourceObj[maxField];
  
  if (min !== undefined) {
    const num = Number(min);
    if (isNaN(num) || num < minValue || num > maxValue) {
      return next(new ValidationError(`Min ${fieldName} must be between ${minValue} and ${maxValue}`, minField, min));
    }
    sourceObj[minField] = num;
  }
  
  if (max !== undefined) {
    const num = Number(max);
    if (isNaN(num) || num < minValue || num > maxValue) {
      return next(new ValidationError(`Max ${fieldName} must be between ${minValue} and ${maxValue}`, maxField, max));
    }
    sourceObj[maxField] = num;
  }
  
  if (min && max && Number(min) > Number(max)) {
    return next(new ValidationError(`Min ${fieldName} cannot be greater than max ${fieldName}`, `${fieldName}Range`, { [minField]: min, [maxField]: max }));
  }
  
  next();
};

/**
 * Generic enum validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} field - Field name to validate
 * @param {Array} validValues - Array of valid values
 * @param {string} fieldName - Human readable field name for error messages
 * @param {string} source - Source of parameters ('query' or 'params')
 * @param {boolean} required - Whether the field is required
 */
const validateEnum = (req, res, next, field, validValues, fieldName, source = 'query', required = false) => {
  const sourceObj = req[source];
  const value = sourceObj[field];
  
  if (value !== undefined) {
    if (!validValues.includes(value.toLowerCase())) {
      return next(new ValidationError(`Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`, field, value));
    }
    sourceObj[field] = value.toLowerCase();
  } else if (required) {
    return next(new ValidationError(`${fieldName} is required`, field, value));
  }
  
  next();
};

/**
 * Generic numeric field validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} field - Field name to validate
 * @param {number} minValue - Minimum allowed value
 * @param {number} maxValue - Maximum allowed value
 * @param {string} fieldName - Human readable field name for error messages
 * @param {string} source - Source of parameters ('query' or 'params')
 * @param {boolean} allowZero - Whether to allow zero values
 */
const validateNumericField = (req, res, next, field, minValue, maxValue, fieldName, source = 'query', allowZero = true) => {
  const sourceObj = req[source];
  const value = sourceObj[field];
  
  if (value !== undefined) {
    const num = Number(value);
    if (isNaN(num) || num < minValue || num > maxValue || (!allowZero && num === 0)) {
      const rangeText = allowZero ? `between ${minValue} and ${maxValue}` : `between ${minValue} and ${maxValue} (excluding 0)`;
      return next(new ValidationError(`${fieldName} must be ${rangeText}`, field, value));
    }
    sourceObj[field] = num;
  }
  
  next();
};

/**
 * Generic string field validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} field - Field name to validate
 * @param {number} minLength - Minimum string length
 * @param {number} maxLength - Maximum string length
 * @param {string} fieldName - Human readable field name for error messages
 * @param {string} source - Source of parameters ('query' or 'params')
 * @param {boolean} required - Whether the field is required
 */
const validateStringField = (req, res, next, field, minLength, maxLength, fieldName, source = 'query', required = false) => {
  const sourceObj = req[source];
  const value = sourceObj[field];
  
  if (value !== undefined) {
    if (typeof value !== 'string' || value.trim().length < minLength || value.trim().length > maxLength) {
      return next(new ValidationError(`${fieldName} must be a string between ${minLength} and ${maxLength} characters`, field, value));
    }
    sourceObj[field] = value.trim();
  } else if (required) {
    return next(new ValidationError(`${fieldName} is required`, field, value));
  }
  
  next();
};

/**
 * ZIP code validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateZipcode = (req, res, next) => {
  const zipcode = req.params.zipcode || req.query.zipcode;
  
  if (!zipcode || !isValidZipcode(zipcode)) {
    return next(new ValidationError('Invalid ZIP code format. Must be 5 digits.', 'zipcode', zipcode));
  }
  
  // Sanitize ZIP code
  const sanitizedZipcode = zipcode.trim();
  if (req.params.zipcode) {
    req.params.zipcode = sanitizedZipcode;
  }
  if (req.query.zipcode) {
    req.query.zipcode = sanitizedZipcode;
  }
  
  next();
};

/**
 * City validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateCity = (req, res, next) => {
  const { city } = req.params;
  
  if (!city || !isValidCity(city)) {
    return next(new ValidationError('Invalid city name. Must be a non-empty string between 2-100 characters.', 'city', city));
  }
  
  // Sanitize city name
  req.params.city = sanitizeString(city);
  next();
};

/**
 * State validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateState = (req, res, next) => {
  const { state } = req.params;
  
  if (!state) {
    return next(new ValidationError('State is required', 'state', state));
  }
  
  if (!isValidState(state)) {
    return next(new ValidationError('Invalid state abbreviation', 'state', state));
  }
  
  // Normalize state to uppercase
  req.params.state = state.toUpperCase();
  next();
};

/**
 * State validation middleware for query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateStateQuery = (req, res, next) => {
  const { state } = req.query;
  
  if (state !== undefined) {
    if (!state || state.trim().length === 0) {
      return next(new ValidationError('State is required. Please select a state from the dropdown or enter a 2-letter state abbreviation (e.g., NY, CA, TX).', 'state', state));
    }
    
    const trimmedState = state.trim();
    if (trimmedState.length !== 2) {
      return next(new ValidationError('State must be a 2-letter abbreviation (e.g., NY for New York, CA for California). Please check your spelling.', 'state', state));
    }
    
    if (!/^[A-Za-z]{2}$/.test(trimmedState)) {
      return next(new ValidationError('State must be a 2-letter abbreviation using only letters (e.g., NY, CA, TX). Please check your spelling.', 'state', state));
    }
    
    // Normalize state to uppercase
    req.query.state = trimmedState.toUpperCase();
  }
  next();
};

/**
 * Limit validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLimit = (req, res, next) => {
  logger.debug('Entered validateLimit', { query: req.query });
  const limit = req.query.limit;
  if (limit !== undefined) {
    if (!/^[0-9]+$/.test(limit) || limit < 1) {
      return next(new ValidationError('Limit must be a positive number between 1 and 100', 'limit', limit));
    }
    if (limit > 100) {
      return next(new ValidationError('Limit cannot exceed 100', 'limit', limit));
    }
  }
  next();
};

/**
 * City validation middleware for query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateCityQuery = (req, res, next) => {
  const { city } = req.query;
  
  if (city !== undefined) {
    if (!city || city.trim().length === 0) {
      return next(new ValidationError('City name cannot be empty. Please enter a valid city name.', 'city', city));
    }
    
    const trimmedCity = city.trim();
    if (trimmedCity.length < 2) {
      return next(new ValidationError('City name must be at least 2 characters long. Please check your spelling.', 'city', city));
    }
    
    if (trimmedCity.length > 100) {
      return next(new ValidationError('City name is too long. Please enter a shorter city name.', 'city', city));
    }
    
    // Allow more flexible city name validation (letters, spaces, hyphens, apostrophes, periods, and common city name characters)
    if (!/^[a-zA-Z\s\-'.()]+$/.test(trimmedCity)) {
      return next(new ValidationError('City name contains invalid characters. Please use only letters, spaces, hyphens, and apostrophes.', 'city', city));
    }
    
    // Sanitize city name if present
    req.query.city = sanitizeString(trimmedCity);
  }
  next();
};

/**
 * General request validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  logger.debug('Entered validateRequest', { query: req.query, body: req.body });
  try {
    // Sanitize query parameters
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
    
    // Sanitize body parameters
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }
    
    logger.debug('validateRequest completed successfully');
    next();
  } catch (error) {
    logger.error('validateRequest error', { error: error.message });
    next(error);
  }
};

module.exports = {
  validateZipcode,
  validateCity,
  validateCityQuery,
  validateState,
  validateStateQuery,
  validateLimit,
  validateRequest,
  validateNumericRange,
  validateEnum,
  validateNumericField,
  validateStringField
}; 