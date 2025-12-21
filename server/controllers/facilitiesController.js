const facilitiesService = require('../services/facilitiesService');
const ResponseUtils = require('../utils/responseUtils');

/**
 * Facilities Controller
 * Handles HTTP requests for facilities endpoints
 * Delegates business logic to service layer
 * Uses ResponseUtils for consistent response formatting
 */

class FacilitiesController {
  /**
   * Get top facilities by ZIP code
   * @param {string} zipcode - ZIP code to search
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with facilities
   */
  static async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    try {
      // Delegate to service layer
      const result = await facilitiesService.getTopFacilitiesByZipcode(zipcode, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'top_facilities', ...result.metadata });
    } catch (error) {
      throw new Error(`Error fetching top facilities: ${error.message}`);
    }
  }

  /**
   * Search facilities with multiple criteria
   * @param {Object} criteria - Search criteria object
   * @param {string} criteria.zipcode - ZIP code filter
   * @param {string} criteria.city - City filter
   * @param {string} criteria.facilityType - Facility type filter
   * @param {number} criteria.limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with facilities
   */
  static async searchFacilities(criteria) {
    try {
      // Delegate to service layer
      const result = await facilitiesService.searchFacilities(criteria);
      return ResponseUtils.formatSearch(result.data, 'facility_search', criteria);
    } catch (error) {
      throw new Error(`Error searching facilities: ${error.message}`);
    }
  }

  /**
   * Get average childcare centers by criteria
   * @param {string} city - City name
   * @param {number} minRating - Minimum rating filter
   * @returns {Promise<Object>} Formatted response with average childcare statistics
   */
  static async getAverageChildcareByCriteria(city, minRating = 0) {
    try {
      // Delegate to service layer
      const result = await facilitiesService.getAverageChildcareByCriteria(city, minRating);
      return ResponseUtils.formatStatistics(result.data, city);
    } catch (error) {
      throw new Error(`Error fetching childcare statistics: ${error.message}`);
    }
  }

  /**
   * Get facilities count by type
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Formatted response with count of facilities by type
   */
  static async getFacilitiesCountByType(zipcode) {
    try {
      const result = await facilitiesService.getFacilitiesCountByType(zipcode);
      // Always return an array for data
      return ResponseUtils.formatSuccess(Array.isArray(result.data) ? result.data : [], { type: 'facilities_count', zipcode });
    } catch (error) {
      throw new Error(`Error fetching facilities count: ${error.message}`);
    }
  }

  /**
   * Get childcare facilities by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with childcare facilities
   */
  static async getChildcareByCity(city, limit = 10) {
    try {
      // Delegate to service layer
      const result = await facilitiesService.getChildcareByCity(city, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'childcare_facilities', ...result.metadata });
    } catch (error) {
      throw new Error(`Error fetching childcare facilities: ${error.message}`);
    }
  }

  /**
   * Validate ZIP code format and existence
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<Object>} Formatted validation result
   */
  static async validateZipcode(zipcode) {
    try {
      const result = await facilitiesService.validateZipcode(zipcode);
      return ResponseUtils.formatSuccess(result.data, 'zipcode_validation');
    } catch (error) {
      if (error.name === 'ValidationError') {
        return ResponseUtils.formatError(error.message, 400, 'facilities/validate', { zipcode });
      }
      throw new Error(`Error validating ZIP code: ${error.message}`);
    }
  }

  /**
   * Validate ZIP code format (synchronous)
   * @param {string} zipcode - ZIP code to validate
   * @returns {boolean} True if valid format, false otherwise
   */
  static validateZipcodeFormat(zipcode) {
    return zipcode && zipcode.length === 5 && /^\d{5}$/.test(zipcode);
  }

  /**
   * Validate city name
   * @param {string} city - City name to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static validateCity(city) {
    return city && city.trim().length > 0 && city.trim().length <= 100;
  }

  /**
   * Format facility response
   * @param {Array} facilities - Raw facility data
   * @returns {Object} Formatted response
   */
  static formatFacilitiesResponse(facilities) {
    return ResponseUtils.formatSuccess(facilities, 'facilities');
  }
}

module.exports = FacilitiesController; 