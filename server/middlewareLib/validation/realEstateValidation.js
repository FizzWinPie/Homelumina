/**
 * Real Estate Validation Middleware
 * Contains validation functions specific to real estate endpoints
 */

const { ValidationError } = require('../errorHandler');
const {
  isValidPrice,
  isValidPriceRange,
  sanitizeNumber
} = require('../../utils/validationUtils');
const { logger } = require('../../utils/logger');

// Import common validations
const {
  validateZipcode,
  validateCity,
  validateState,
  validateLimit,
  validateRequest,
  validateNumericRange,
  validateEnum,
  validateNumericField
} = require('./commonValidation');

/**
 * Price range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePriceRange = (req, res, next) => {
  const { minPrice, maxPrice } = req.query;
  
  if (minPrice && maxPrice && !isValidPriceRange(minPrice, maxPrice)) {
    return next(new ValidationError('Invalid price range. Min price cannot be greater than max price.', 'priceRange', { minPrice, maxPrice }));
  }
  
  // Sanitize price values
  if (minPrice) req.query.minPrice = sanitizeNumber(minPrice);
  if (maxPrice) req.query.maxPrice = sanitizeNumber(maxPrice);
  
  next();
};

/**
 * Price validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePrice = (req, res, next) => {
  // Validate maxPrice (must be positive)
  validateNumericField(req, res, (err) => {
    if (err) return next(err);
    
    // Validate minPrice (can be zero)
    validateNumericField(req, res, next, 'minPrice', 0, Number.MAX_SAFE_INTEGER, 'min price', 'query', true);
  }, 'maxPrice', 1, Number.MAX_SAFE_INTEGER, 'max price', 'query', false);
};

/**
 * Bedrooms validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateBedrooms = (req, res, next) => {
  return validateNumericField(req, res, next, 'bedrooms', 0, 10, 'bedrooms');
};

/**
 * Property type validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePropertyType = (req, res, next) => {
  const validTypes = ['house', 'condo', 'apartment', 'townhouse', 'land'];
  return validateEnum(req, res, next, 'propertyType', validTypes, 'property type');
};

/**
 * Year built validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateYearBuilt = (req, res, next) => {
  const currentYear = new Date().getFullYear();
  return validateNumericRange(req, res, next, 'minYear', 'maxYear', 1800, currentYear, 'year');
};

module.exports = {
  // Real estate specific validations
  validatePriceRange,
  validatePrice,
  validateBedrooms,
  validatePropertyType,
  validateYearBuilt
}; 