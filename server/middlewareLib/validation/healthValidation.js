/**
 * Health Validation Middleware
 * Contains validation functions specific to health endpoints
 */

const { ValidationError } = require('../errorHandler');
const {
  isValidHealthMeasureType,
  isValidNumericRange,
  isValidDateMonth,
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
 * Health measure type validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateHealthMeasureType = (req, res, next) => {
  const validTypes = ['asthma', 'obesity', 'social_isolation', 'diabetes'];
  return validateEnum(req, res, next, 'type', validTypes, 'health measure type', 'params', true);
};

/**
 * Health measure type validation middleware for query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateHealthMeasureTypeQuery = (req, res, next) => {
  const validTypes = ['asthma', 'obesity', 'social_isolation', 'diabetes'];
  return validateEnum(req, res, next, 'type', validTypes, 'health measure type');
};

/**
 * Year range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateYearRange = (req, res, next) => {
  const currentYear = new Date().getFullYear();
  return validateNumericRange(req, res, next, 'startYear', 'endYear', 2000, currentYear, 'year');
};

/**
 * Date month validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateDateMonth = (req, res, next) => {
  const { date } = req.query;
  
  if (date !== undefined && !isValidDateMonth(date)) {
    return next(new ValidationError('Invalid date format. Must be YYYYMM format', 'date', date));
  }
  
  next();
};

/**
 * Health score validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateHealthScore = (req, res, next) => {
  return validateNumericRange(req, res, next, 'minScore', 'maxScore', 0, 100, 'score');
};

/**
 * Health threshold validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateHealthThreshold = (req, res, next) => {
  return validateNumericField(req, res, next, 'threshold', 0, 100, 'threshold');
};

module.exports = {
  // Health specific validations
  validateHealthMeasureType,
  validateHealthMeasureTypeQuery,
  validateYearRange,
  validateDateMonth,
  validateHealthScore,
  validateHealthThreshold
}; 