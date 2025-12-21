/**
 * Facilities Validation Middleware
 * Contains validation functions specific to facilities endpoints
 */

const { ValidationError } = require('../errorHandler');
const {
  isValidFacilityType,
  isValidNumericRange,
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
  validateEnum,
  validateNumericField,
  validateStringField
} = require('./commonValidation');

/**
 * Facility type validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFacilityType = (req, res, next) => {
  const validTypes = ['childcare', 'hospital', 'police', 'firefighter'];
  return validateEnum(req, res, next, 'type', validTypes, 'facility type', 'params', true);
};

/**
 * Facility type validation middleware for query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFacilityTypeQuery = (req, res, next) => {
  const validTypes = ['childcare', 'hospital', 'police', 'firefighter'];
  return validateEnum(req, res, next, 'type', validTypes, 'facility type');
};

/**
 * Rating validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRating = (req, res, next) => {
  return validateNumericField(req, res, next, 'minRating', 0, 5, 'rating');
};

/**
 * Distance validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateDistance = (req, res, next) => {
  return validateNumericField(req, res, next, 'maxDistance', 0, 100, 'max distance', 'query', false);
};

/**
 * Facility name validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFacilityName = (req, res, next) => {
  return validateStringField(req, res, next, 'name', 2, 100, 'facility name');
};

/**
 * Facility status validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFacilityStatus = (req, res, next) => {
  const validStatuses = ['active', 'inactive', 'pending', 'closed'];
  return validateEnum(req, res, next, 'status', validStatuses, 'facility status');
};

module.exports = {
  // Facilities specific validations
  validateFacilityType,
  validateFacilityTypeQuery,
  validateRating,
  validateDistance,
  validateFacilityName,
  validateFacilityStatus
}; 