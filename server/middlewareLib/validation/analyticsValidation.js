/**
 * Analytics Validation Middleware
 * Contains validation functions specific to analytics endpoints
 */

const { ValidationError } = require('../errorHandler');
const {
  isValidNumericRange,
  sanitizeNumber
} = require('../../utils/validationUtils');
const { logger } = require('../../utils/logger');

// Import common validations
const {
  validateZipcode,
  validateCity,
  validateCityQuery,
  validateState,
  validateStateQuery,
  validateLimit,
  validateRequest,
  validateNumericRange,
  validateEnum,
  validateNumericField
} = require('./commonValidation');

/**
 * Price validation middleware for analytics
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
 * Year range validation middleware for analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateYearRange = (req, res, next) => {
  const currentYear = new Date().getFullYear();
  return validateNumericRange(req, res, next, 'startYear', 'endYear', 2000, currentYear, 'year');
};

/**
 * Population range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePopulationRange = (req, res, next) => {
  return validateNumericRange(req, res, next, 'minPopulation', 'maxPopulation', 0, Number.MAX_SAFE_INTEGER, 'population');
};

/**
 * Income range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateIncomeRange = (req, res, next) => {
  return validateNumericRange(req, res, next, 'minIncome', 'maxIncome', 0, Number.MAX_SAFE_INTEGER, 'income');
};

/**
 * Growth rate validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateGrowthRate = (req, res, next) => {
  return validateNumericRange(req, res, next, 'minGrowthRate', 'maxGrowthRate', -100, 1000, 'growth rate');
};

/**
 * Comparison type validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateComparisonType = (req, res, next) => {
  const validTypes = ['price', 'population', 'growth', 'facilities', 'health'];
  return validateEnum(req, res, next, 'comparisonType', validTypes, 'comparison type');
};

module.exports = {
  // Analytics specific validations
  validatePrice,
  validateYearRange,
  validatePopulationRange,
  validateIncomeRange,
  validateGrowthRate,
  validateComparisonType
}; 