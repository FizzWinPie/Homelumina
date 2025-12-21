/**
 * Search Validation Middleware
 * Contains validation functions specific to search endpoints
 */

const { ValidationError } = require('../errorHandler');
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
  validateEnum,
  validateStringField
} = require('./commonValidation');

/**
 * Search query validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSearchQuery = (req, res, next) => {
  const { q, query } = req.query;
  const searchTerm = q || query;
  
  if (searchTerm !== undefined) {
    if (typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
      return next(new ValidationError('Search query must be at least 2 characters long', 'query', searchTerm));
    }
    
    if (searchTerm.trim().length > 100) {
      return next(new ValidationError('Search query cannot exceed 100 characters', 'query', searchTerm));
    }
    
    // Sanitize search term
    req.query.q = searchTerm.trim();
    req.query.query = searchTerm.trim();
  }
  
  next();
};

/**
 * Search type validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSearchType = (req, res, next) => {
  const validTypes = ['zipcode', 'city', 'state', 'all'];
  return validateEnum(req, res, next, 'type', validTypes, 'search type');
};

/**
 * Autocomplete validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateAutocomplete = (req, res, next) => {
  return validateStringField(req, res, next, 'term', 1, 50, 'autocomplete term');
};

/**
 * Featured cities validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFeaturedCities = (req, res, next) => {
  const validCategories = ['popular', 'growing', 'affordable', 'luxury', 'family'];
  return validateEnum(req, res, next, 'category', validCategories, 'category');
};

/**
 * ZIP code range validation middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateZipcodeRange = (req, res, next) => {
  const { startZip, endZip } = req.query;
  
  if (startZip !== undefined) {
    if (!/^\d{5}$/.test(startZip)) {
      return next(new ValidationError('Start ZIP code must be 5 digits', 'startZip', startZip));
    }
  }
  
  if (endZip !== undefined) {
    if (!/^\d{5}$/.test(endZip)) {
      return next(new ValidationError('End ZIP code must be 5 digits', 'endZip', endZip));
    }
  }
  
  if (startZip && endZip && startZip > endZip) {
    return next(new ValidationError('Start ZIP code cannot be greater than end ZIP code', 'zipRange', { startZip, endZip }));
  }
  
  next();
};

/**
 * ZIP code summaries validation middleware
 * Provides user-friendly error messages and suggestions for common mistakes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateZipcodeSummaries = (req, res, next) => {
  const { city, state, healthMeasure } = req.query;
  
  // Check for missing required parameters
  if (!state || state.trim().length === 0) {
    return next(new ValidationError(
      'State is required for search. Please select a state from the dropdown or enter a 2-letter state abbreviation (e.g., NY, CA, TX).',
      'state',
      state
    ));
  }
  
  if (!healthMeasure || healthMeasure.trim().length === 0) {
    return next(new ValidationError(
      'Health measure is required. Please select a health measure from the dropdown.',
      'healthMeasure',
      healthMeasure
    ));
  }
  
  // Validate state format
  const trimmedState = state.trim();
  if (trimmedState.length !== 2) {
    return next(new ValidationError(
      `State must be a 2-letter abbreviation. You entered "${state}" which has ${trimmedState.length} characters. Please use format like NY, CA, TX.`,
      'state',
      state
    ));
  }
  
  if (!/^[A-Za-z]{2}$/.test(trimmedState)) {
    return next(new ValidationError(
      `State must be a 2-letter abbreviation using only letters. You entered "${state}". Please use format like NY, CA, TX.`,
      'state',
      state
    ));
  }
  
  // Validate city if provided
  if (city !== undefined && city !== null) {
    const trimmedCity = city.trim();
    if (trimmedCity.length > 0) {
      if (trimmedCity.length < 2) {
        return next(new ValidationError(
          'City name must be at least 2 characters long. Please check your spelling or try a different city name.',
          'city',
          city
        ));
      }
      
      if (trimmedCity.length > 100) {
        return next(new ValidationError(
          'City name is too long. Please enter a shorter city name.',
          'city',
          city
        ));
      }
      
      // Allow more flexible city name validation
      if (!/^[a-zA-Z\s\-'.()]+$/.test(trimmedCity)) {
        return next(new ValidationError(
          'City name contains invalid characters. Please use only letters, spaces, hyphens, and apostrophes.',
          'city',
          city
        ));
      }
    }
  }
  
  // Normalize parameters
  req.query.state = trimmedState.toUpperCase();
  if (city && city.trim().length > 0) {
    req.query.city = city.trim();
  }
  
  next();
};

module.exports = {
  // Search specific validations
  validateSearchQuery,
  validateSearchType,
  validateAutocomplete,
  validateFeaturedCities,
  validateZipcodeRange,
  validateZipcodeSummaries
}; 