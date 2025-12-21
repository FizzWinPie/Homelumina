/**
 * Validation utilities for common data types
 * Provides reusable validation functions for the application
 */

/**
 * Validate ZIP code format (5 digits)
 * @param {string} zipcode - ZIP code to validate
 * @returns {boolean} True if valid
 */
function isValidZipcode(zipcode) {
  if (!zipcode || typeof zipcode !== 'string') {
    return false;
  }
  return /^\d{5}$/.test(zipcode);
}

/**
 * Validate city name format
 * @param {string} city - City name to validate
 * @returns {boolean} True if valid
 */
function isValidCity(city) {
  if (!city || typeof city !== 'string') {
    return false;
  }
  const trimmedCity = city.trim();
  // Must be at least 2 characters long
  if (trimmedCity.length < 2 || trimmedCity.length > 100) {
    return false;
  }
  // Allow letters, spaces, hyphens, apostrophes, and periods
  return /^[a-zA-Z\s\-'.]+$/.test(trimmedCity);
}

/**
 * Validate state abbreviation format
 * @param {string} state - State abbreviation to validate
 * @returns {boolean} True if valid
 */
function isValidState(state) {
  if (!state || typeof state !== 'string') {
    return false;
  }
  return /^[A-Z]{2}$/.test(state.trim());
}

/**
 * Validate price format (positive number)
 * @param {number|string} price - Price to validate
 * @returns {boolean} True if valid
 */
function isValidPrice(price) {
  if (price === null || price === undefined) {
    return false;
  }
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
}

/**
 * Validate limit parameter format and range
 * @param {number|string} limit - Limit to validate
 * @returns {boolean} True if valid
 */
function isValidLimit(limit) {
  if (limit === null || limit === undefined) {
    return false;
  }
  // Check if it's a valid integer string first
  if (typeof limit === 'string' && !/^\d+$/.test(limit)) {
    return false;
  }
  const numLimit = Number(limit);
  return !isNaN(numLimit) && Number.isInteger(numLimit) && numLimit > 0 && numLimit <= 100;
}

/**
 * Validate table name format
 * @param {string} tableName - Table name to validate
 * @param {Array} validTables - Array of valid table names
 * @returns {boolean} True if valid
 */
function isValidTableName(tableName, validTables = []) {
  if (!tableName || typeof tableName !== 'string') {
    return false;
  }
  
  // If validTables is provided, check against the list
  if (validTables.length > 0) {
    return validTables.includes(tableName.toLowerCase());
  }
  
  // Basic format validation (alphanumeric and underscores only)
  return /^[a-zA-Z0-9_]+$/.test(tableName);
}

/**
 * Validate date format (YYYYMM)
 * @param {string} date - Date to validate
 * @returns {boolean} True if valid
 */
function isValidDateMonth(date) {
  if (!date || typeof date !== 'string') {
    return false;
  }
  return /^\d{6}$/.test(date) && date.length === 6;
}

/**
 * Validate facility type
 * @param {string} type - Facility type to validate
 * @returns {boolean} True if valid
 */
function isValidFacilityType(type) {
  if (!type || typeof type !== 'string') {
    return false;
  }
  const validTypes = ['childcare', 'hospital', 'police', 'firefighter'];
  return validTypes.includes(type.toLowerCase());
}

/**
 * Validate health measure type
 * @param {string} type - Health measure type to validate
 * @returns {boolean} True if valid
 */
function isValidHealthMeasureType(type) {
  if (!type || typeof type !== 'string') {
    return false;
  }
  const validTypes = ['asthma', 'obesity', 'social_isolation', 'diabetes'];
  return validTypes.includes(type.toLowerCase());
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.trim();
}

/**
 * Sanitize number input
 * @param {number|string} num - Number to sanitize
 * @returns {number} Sanitized number
 */
function sanitizeNumber(num) {
  if (num === null || num === undefined) {
    return null;
  }
  const sanitized = Number(num);
  return isNaN(sanitized) ? null : sanitized;
}

/**
 * Validate numeric range
 * @param {number|string} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
function isValidNumericRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate price range
 * @param {number|string} minPrice - Minimum price
 * @param {number|string} maxPrice - Maximum price
 * @returns {boolean} True if valid
 */
function isValidPriceRange(minPrice, maxPrice) {
  const min = Number(minPrice);
  const max = Number(maxPrice);
  return !isNaN(min) && !isNaN(max) && min >= 0 && max >= 0 && min <= max;
}

module.exports = {
  isValidZipcode,
  isValidCity,
  isValidState,
  isValidPrice,
  isValidLimit,
  isValidTableName,
  isValidDateMonth,
  isValidFacilityType,
  isValidHealthMeasureType,
  sanitizeString,
  sanitizeNumber,
  isValidNumericRange,
  isValidPriceRange
}; 