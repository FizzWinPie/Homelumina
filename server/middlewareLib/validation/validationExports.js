/**
 * Validation Middleware Index
 * Centralized exports for all validation middleware
 */

// Import all service-specific validation modules
const commonValidations = require('./commonValidation');
const realEstateValidations = require('./realEstateValidation');
const facilitiesValidations = require('./facilitiesValidation');
const healthValidations = require('./healthValidation');
const analyticsValidations = require('./analyticsValidation');
const searchValidations = require('./searchValidation');

// Export all validations
module.exports = {
  // Common validations (most frequently used)
  ...commonValidations,
  
  // Service-specific validations
  ...realEstateValidations,
  ...facilitiesValidations,
  ...healthValidations,
  ...analyticsValidations,
  ...searchValidations,
  
  // Service-specific modules (for selective importing)
  realEstate: realEstateValidations,
  facilities: facilitiesValidations,
  health: healthValidations,
  analytics: analyticsValidations,
  search: searchValidations,
  common: commonValidations
}; 