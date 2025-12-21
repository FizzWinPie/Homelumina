const healthRepository = require('../repositories/healthRepository');

/**
 * Health Service
 * Handles business logic for health operations
 * Delegates data access to repository layer
 * Uses ResponseUtils for consistent response formatting
 */

class HealthService {
  /**
   * Get health measures by zipcode
   * @param {string} zipcode - ZIP code to search
   * @param {string} measureType - Type of health measure
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with health measures
   */
  static async getHealthMeasuresByZipcode(zipcode, measureType, limit = 10) {
    const data = await healthRepository.getHealthMeasuresByZipcode(zipcode, measureType, limit);
    return { success: true, data };
  }

  /**
   * Get health measures by city and state
   * @param {string} city - City name (path param)
   * @param {string} state - State abbreviation (path param)
   * @param {number} limit - Number of results to return (query param)
   * @returns {Promise<Object>} Formatted response with health measures
   */
  static async getHealthMeasuresByCity(city, state, limit = 10) {
    const data = await healthRepository.getHealthMeasuresByCity(city, state, limit);
    return { success: true, data };
  }

  /**
   * Get health measures by year range
   * @param {string} startYear - Start year
   * @param {string} endYear - End year
   * @param {string} measureType - Type of health measure
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with health measures
   */
  static async getHealthMeasuresByYearRange(startYear, endYear, measureType, limit = 10) {
    const data = await healthRepository.getHealthMeasuresByYearRange(startYear, endYear, measureType, limit);
    return { success: true, data };
  }

  /**
   * Get health measure trends
   * @param {string} measureType - Type of health measure
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with health measure trends
   */
  static async getHealthMeasureTrends(measureType, limit = 10) {
    const data = await healthRepository.getHealthMeasureTrends(measureType, limit);
    return { success: true, data };
  }

  /**
   * Get health measures comparison
   * @param {string} zipcode1 - First ZIP code
   * @param {string} zipcode2 - Second ZIP code
   * @param {string} measureType - Type of health measure
   * @returns {Promise<Object>} Formatted response with health measures comparison
   */
  static async getHealthMeasuresComparison(zipcode1, zipcode2, measureType) {
    const data = await healthRepository.getHealthMeasuresComparison(zipcode1, zipcode2, measureType);
    return { success: true, data };
  }

  /**
   * Get health statistics by zipcode
   * @param {string} zipcode - ZIP code to get stats for
   * @returns {Promise<Object>} Formatted response with health statistics
   */
  static async getHealthStatsByZipcode(zipcode) {
    const data = await healthRepository.getHealthStatsByZipcode(zipcode);
    return { success: true, data };
  }

  /**
   * Search health measures
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Formatted response with search results
   */
  static async searchHealthMeasures(filters) {
    const data = await healthRepository.searchHealthMeasures(filters);
    return { success: true, data };
  }

  /**
   * Get available health measures
   * @returns {Promise<Object>} Formatted response with available health measures
   */
  static async getAvailableHealthMeasures() {
    const data = await healthRepository.getAvailableHealthMeasures();
    return { success: true, data };
  }

  /**
   * Get community health properties
   * @param {string} zipcode - ZIP code to get community health properties for
   * @returns {Promise<Object>} Formatted response with community health properties
   */
  static async getCommunityHealthProperties(zipcode) {
    const data = await healthRepository.getCommunityHealthProperties(zipcode);
    return { success: true, data };
  }

  /**
   * Validate health parameters
   * @returns {boolean} True if valid
   */
  static validateHealthParams() {
    // Add validation logic here if needed
    return true;
  }

  /**
   * Validate if zipcode has health data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if zipcode has health data
   */
  static async validateZipcode(zipcode) {
    return healthRepository.validateZipcode(zipcode);
  }
}

module.exports = HealthService; 