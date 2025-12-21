const DatabaseUtils = require('../utils/databaseUtils');
const queryLoader = require('../utils/queryLoader');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Health Repository
 * Handles all database operations for health data
 */
class HealthRepository {
  /**
   * Get health measures by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Array>} Health measures data
   */
  async getHealthMeasuresByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('health-measures-by-zipcode', 'health');
      return DatabaseUtils.executeQuery(query, [zipcode], 'getHealthMeasuresByZipcode');
    } catch (error) {
      throw new Error(`Database error in getHealthMeasuresByZipcode: ${error.message}`);
    }
  }

  /**
   * Get health measures by city and state
   * @param {string} city
   * @param {string} state
   * @param {number} limit
   * @returns {Promise<Array>} Health measures for the city and state
   */
  async getHealthMeasuresByCity(city, state, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('health-measures-by-city', 'health');
      return DatabaseUtils.executeQuery(query, [`%${city}%`, `%${state}%`, limit], 'getHealthMeasuresByCity');
    } catch (error) {
      logger.error('Database error in getHealthMeasuresByCity', error);
      throw error;
    }
  }

  /**
   * Get health statistics by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Health statistics
   */
  async getHealthStatsByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('health-stats-by-zipcode', 'health');
      return DatabaseUtils.executeQuery(query, [zipcode], 'getHealthStatsByZipcode');
    } catch (error) {
      throw new Error(`Database error in getHealthStatsByZipcode: ${error.message}`);
    }
  }

  /**
   * Search health measures by criteria
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.healthMeasure - Health measure filter
   * @param {string} criteria.city - City filter
   * @param {string} criteria.zipcode - ZIP code filter
   * @param {number} criteria.minYear - Minimum year filter
   * @param {number} criteria.maxYear - Maximum year filter
   * @param {number} criteria.minValue - Minimum value filter
   * @param {number} criteria.maxValue - Maximum value filter
   * @param {number} criteria.limit - Result limit
   * @returns {Promise<Array>} Health measures data
   */
  async searchHealthMeasures(criteria) {
    const { 
      healthMeasure, 
      city, 
      zipcode, 
      minYear = 1900, 
      maxYear = 2100,
      minValue = 0,
      maxValue = 999999999,
      limit = 10 
    } = criteria;

    try {
      const query = await queryLoader.loadQuery('search-health-measures', 'health');
      
      // Prepare parameters in the order expected by the SQL query
      const params = [
        healthMeasure ? `%${healthMeasure}%` : null,  // $1 - healthMeasure (optional)
        city ? `%${city}%` : null,                     // $2 - city (optional)
        zipcode || null,                               // $3 - zipcode (optional)
        minYear > 1900 ? minYear : null,               // $4 - minYear (optional)
        maxYear < 2100 ? maxYear : null,               // $5 - maxYear (optional)
        minValue > 0 ? minValue : null,                // $6 - minValue (optional)
        maxValue < 999999999 ? maxValue : null,        // $7 - maxValue (optional)
        DatabaseUtils.sanitizeLimit(limit)             // $8 - limit
      ];

      return DatabaseUtils.executeQuery(query, params, 'searchHealthMeasures');
    } catch (error) {
      throw new Error(`Database error in searchHealthMeasures: ${error.message}`);
    }
  }

  /**
   * Get health measure trends by zipcode
   * @param {string} zipcode - ZIP code to search
   * @param {string} healthMeasure - Health measure to analyze
   * @returns {Promise<Array>} Health measure trends
   */
  async getHealthMeasureTrends(zipcode, healthMeasure) {
    try {
      const query = await queryLoader.loadQuery('health-measure-trends', 'health');
      return DatabaseUtils.executeQuery(query, [zipcode, `%${healthMeasure}%`], 'getHealthMeasureTrends');
    } catch (error) {
      throw new Error(`Database error in getHealthMeasureTrends: ${error.message}`);
    }
  }

  /**
   * Get health measures comparison between zipcodes
   * @param {Array} zipcodes - Array of ZIP codes to compare
   * @param {string} healthMeasure - Health measure to compare
   * @returns {Promise<Array>} Health measures comparison data
   */
  async getHealthMeasuresComparison(zipcodes, healthMeasure) {
    try {
      const query = await queryLoader.loadQuery('health-measures-comparison', 'health');
      return DatabaseUtils.executeQuery(query, [zipcodes, `%${healthMeasure}%`], 'getHealthMeasuresComparison');
    } catch (error) {
      throw new Error(`Database error in getHealthMeasuresComparison: ${error.message}`);
    }
  }

  /**
   * Get available health measures
   * @returns {Promise<Array>} Available health measures
   */
  async getAvailableHealthMeasures() {
    try {
      const query = await queryLoader.loadQuery('available-health-measures', 'health');
      return DatabaseUtils.executeQuery(query, [], 'getAvailableHealthMeasures');
    } catch (error) {
      throw new Error(`Database error in getAvailableHealthMeasures: ${error.message}`);
    }
  }

  /**
   * Get health measures by year range
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Health measures data
   */
  async getHealthMeasuresByYearRange(startYear, endYear, limit = 10) {
    try {
      const sanitizedLimit = DatabaseUtils.sanitizeLimit(limit);
      const query = await queryLoader.loadQuery('health-measures-by-year-range', 'health');
      return DatabaseUtils.executeQuery(query, [startYear, endYear, sanitizedLimit], 'getHealthMeasuresByYearRange');
    } catch (error) {
      throw new Error(`Database error in getHealthMeasuresByYearRange: ${error.message}`);
    }
  }

  /**
   * Validate if zipcode has health data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if zipcode has health data
   */
  async validateZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('validate-zipcode', 'health');
      const count = await DatabaseUtils.executeQueryCount(query, [zipcode], 'validateZipcode');
      return count > 0;
    } catch (error) {
      throw new Error(`Database error in validateZipcode: ${error.message}`);
    }
  }

  /**
   * Get community health properties for a specific ZIP code
   * @param {string} zipcode - ZIP code to get community health data for
   * @returns {Promise<Object>} Community health properties data
   */
  async getCommunityHealthProperties(zipcode) {
    const query = await queryLoader.loadQuery('community-properties', 'health');
    return DatabaseUtils.executeQuery(query, [zipcode], 'getCommunityHealthProperties');
  }
}

module.exports = new HealthRepository(); 