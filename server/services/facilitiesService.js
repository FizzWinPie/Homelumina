const facilitiesRepository = require('../repositories/facilitiesRepository');

/**
 * Facilities Service
 * Handles business logic for facilities operations
 * Delegates data access to repository layer
 * Uses ResponseUtils for consistent response formatting
 */

class FacilitiesService {
  /**
   * Get top facilities by zipcode
   * @param {string} zipcode - ZIP code to search
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with facilities
   */
  static async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    const data = await facilitiesRepository.getTopFacilitiesByZipcode(zipcode, limit);
    return { success: true, data };
  }

  /**
   * Search facilities with multiple criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object>} Formatted response with search results
   */
  static async searchFacilities(criteria = {}) {
    const data = await facilitiesRepository.searchFacilities(criteria);
    return { success: true, data };
  }

  /**
   * Validate zipcode format
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<Object>} Validation result
   */
  static async validateZipcode(zipcode) {
    // Business logic: Basic format validation
    if (!zipcode || zipcode.length !== 5) {
      const { ValidationError } = require('../middlewareLib/errorHandler');
      throw new ValidationError('Invalid ZIP code format. Must be 5 digits.', 'zipcode', zipcode);
    }

    const isValid = await facilitiesRepository.validateZipcode(zipcode);
    return { success: true, data: { isValid, zipcode } };
  }

  /**
   * Get facility statistics by zipcode
   * @param {string} zipcode - ZIP code to get stats for
   * @returns {Promise<Object>} Formatted response with facility statistics
   */
  static async getFacilityStats(zipcode) {
    const data = await facilitiesRepository.getFacilityStats(zipcode);
    return { success: true, data };
  }

  /**
   * Get average childcare by criteria
   * @param {string} city - City name
   * @returns {Promise<Object>} Formatted response with average childcare data
   */
  static async getAverageChildcareByCriteria(city) {
    const data = await facilitiesRepository.getAverageChildcareByCriteria(city);
    return { success: true, data };
  }

  /**
   * Get facilities count by type
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Formatted response with facilities count
   */
  static async getFacilitiesCountByType(zipcode) {
    const data = await facilitiesRepository.getFacilitiesCountByType(zipcode);
    return { success: true, data };
  }

  /**
   * Get childcare facilities by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with childcare facilities
   */
  static async getChildcareByCity(city, limit = 10) {
    const data = await facilitiesRepository.getChildcareByCity(city, limit);
    return { success: true, data };
  }

  /**
   * Validate facilities parameters
   * @returns {boolean} True if valid
   */
  static validateFacilitiesParams() {
    // Add validation logic here if needed
    return true;
  }
}

module.exports = FacilitiesService; 