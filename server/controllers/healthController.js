const healthService = require('../services/healthService');
const ResponseUtils = require('../utils/responseUtils');
const { logger } = require('../utils/logger');

/**
 * Health Controller
 * Handles HTTP requests for health endpoints
 * Delegates business logic to service layer
 * Uses ResponseUtils for consistent response formatting
 */

class HealthController {
  /**
   * Get health measures by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Formatted response with health measures data
   */
  static async getHealthMeasuresByZipcode(zipcode) {
    try {
      // Delegate to service layer
      const result = await healthService.getHealthMeasuresByZipcode(zipcode);
      return ResponseUtils.formatSuccess(result.data, { type: 'health_measures', zipcode });
    } catch (error) {
      throw new Error(`Error fetching health measures: ${error.message}`);
    }
  }

  /**
   * Controller for getting health measures by city and state
   */
  static async getHealthMeasuresByCity(req, res) {
    const { city, state } = req.params;
    const { limit } = req.query;
    if (!city || !state) {
      return res.status(400).json(ResponseUtils.formatError(
        'Missing required path parameters: city and state',
        400,
        req.originalUrl
      ));
    }
    logger.info('Fetching health measures by city and state', { city, state, limit });
    const response = await healthService.getHealthMeasuresByCity(city, state, limit ? parseInt(limit) : 10);
    logger.info('Health measures by city and state retrieved successfully', { city, state, count: response.data.length });
    return res.status(200).json(ResponseUtils.formatSuccess(response.data, req.originalUrl));
  }

  /**
   * Get health statistics by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Formatted response with health statistics
   */
  static async getHealthStatsByZipcode(zipcode) {
    try {
      // Delegate to service layer
      const result = await healthService.getHealthStatsByZipcode(zipcode);
      return ResponseUtils.formatStatistics(result.data, zipcode);
    } catch (error) {
      throw new Error(`Error fetching health statistics: ${error.message}`);
    }
  }

  /**
   * Search health measures
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object>} Formatted response with health measures
   */
  static async searchHealthMeasures(criteria) {
    try {
      // Delegate to service layer
      const result = await healthService.searchHealthMeasures(criteria);
      return ResponseUtils.formatSearch(result.data, 'health_measures_search', criteria);
    } catch (error) {
      throw new Error(`Error searching health measures: ${error.message}`);
    }
  }

  /**
   * Get health measure trends
   * @param {string} zipcode - ZIP code to search
   * @param {string} healthMeasure - Health measure to analyze
   * @returns {Promise<Object>} Formatted response with health measure trends
   */
  static async getHealthMeasureTrends(zipcode, healthMeasure) {
    try {
      // Delegate to service layer
      const result = await healthService.getHealthMeasureTrends(zipcode, healthMeasure);
      return ResponseUtils.formatSuccess(result.data, { type: 'health_measure_trends', zipcode, healthMeasure });
    } catch (error) {
      throw new Error(`Error fetching health measure trends: ${error.message}`);
    }
  }

  /**
   * Get health measures comparison
   * @param {Array} zipcodes - Array of ZIP codes to compare
   * @param {string} healthMeasure - Health measure to compare
   * @returns {Promise<Object>} Formatted response with health measures comparison data
   */
  static async getHealthMeasuresComparison(zipcodes, healthMeasure) {
    try {
      // Delegate to service layer
      const result = await healthService.getHealthMeasuresComparison(zipcodes, healthMeasure);
      return ResponseUtils.formatComparison(result.data, zipcodes.join(','));
    } catch (error) {
      throw new Error(`Error comparing health measures: ${error.message}`);
    }
  }

  /**
   * Get available health measures
   * @returns {Promise<Object>} Formatted response with available health measures
   */
  static async getAvailableHealthMeasures() {
    try {
      // Delegate to service layer
      const result = await healthService.getAvailableHealthMeasures();
      return ResponseUtils.formatSuccess(result.data, 'available_health_measures');
    } catch (error) {
      throw new Error(`Error fetching available health measures: ${error.message}`);
    }
  }

  /**
   * Get health measures by year range
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with health measures data
   */
  static async getHealthMeasuresByYearRange(startYear, endYear, limit = 10) {
    try {
      // Delegate to service layer
      const result = await healthService.getHealthMeasuresByYearRange(startYear, endYear, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'health_measures_by_year', startYear, endYear, limit });
    } catch (error) {
      throw new Error(`Error fetching health measures by year range: ${error.message}`);
    }
  }

  /**
   * Validate zipcode
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<Object>} Formatted validation result
   */
  static async validateZipcode(zipcode) {
    try {
      // Delegate to service layer
      const result = await healthService.validateZipcode(zipcode);
      return ResponseUtils.formatSuccess(result, 'zipcode_validation');
    } catch (error) {
      logger.error('Error in validateZipcode:', { message: error.message, stack: error.stack });
      throw new Error(`Error validating zipcode: ${error.message}`);
    }
  }

  /**
   * Get community health properties for a specific ZIP code
   * @param {string} zipcode - ZIP code to get community health data for
   * @returns {Promise<Object>} Formatted response with community health properties
   */
  static async getCommunityHealthProperties(zipcode) {
    try {
      // Delegate to service layer
      const result = await healthService.getCommunityHealthProperties(zipcode);
      return ResponseUtils.formatSuccess(result.data, 'community_health_properties');
    } catch (error) {
      throw new Error(`Error fetching community health properties: ${error.message}`);
    }
  }
}

module.exports = HealthController; 