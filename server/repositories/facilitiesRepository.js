const db = require('../config/database');
const queryLoader = require('../utils/queryLoader');

/**
 * Facilities Repository
 * Handles all database operations for facilities
 */
class FacilitiesRepository {
  /**
   * Get top facilities by zipcode
   * @param {string} zipcode - ZIP code to search
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of facilities
   */
  async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('top-facilities-by-zipcode', 'facilities');
      const result = await db.query(query, [zipcode, limit]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getTopFacilitiesByZipcode: ${error.message}`);
    }
  }

  /**
   * Search facilities with multiple criteria
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.zipcode - ZIP code to search
   * @param {string} criteria.city - City name to search
   * @param {string} criteria.facilityType - Facility type to search
   * @param {number} criteria.limit - Number of results to return
   * @returns {Promise<Array>} Array of facilities matching criteria
   */
  async searchFacilities(criteria = {}) {
    try {
      const { zipcode, city, facilityType, limit = 10 } = criteria;
      
      // Load the proper SQL query file
      const query = await queryLoader.loadQuery('search-facilities', 'facilities');
      
      // Execute query with parameters in the correct order
      const params = [facilityType, zipcode, city, limit];

      const result = await db.query(query, params);
      
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in searchFacilities: ${error.message}`);
    }
  }

  /**
   * Validate if zipcode has facilities
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if zipcode has facilities
   */
  async validateZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('validate-zipcode', 'facilities');
      const result = await db.query(query, [zipcode]);
      return result && result.rows && result.rows[0] ? parseInt(result.rows[0].count) > 0 : false;
    } catch (error) {
      throw new Error(`Database error in validateZipcode: ${error.message}`);
    }
  }

  /**
   * Get facility statistics by zipcode
   * @param {string} zipcode - ZIP code to get stats for
   * @returns {Promise<Object>} Facility statistics
   */
  async getFacilityStats(zipcode) {
    try {
      const query = await queryLoader.loadQuery('facility-stats', 'facilities');
      const result = await db.query(query, [zipcode]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getFacilityStats: ${error.message}`);
    }
  }

  /**
   * Get average childcare centers by criteria
   * @param {string} city - City name
   * @returns {Promise<Object>} Average childcare statistics
   */
  async getAverageChildcareByCriteria(city) {
    try {
      const query = await queryLoader.loadQuery('average-childcare-by-criteria', 'facilities');
      const result = await db.query(query, [`%${city}%`]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getAverageChildcareByCriteria: ${error.message}`);
    }
  }

  /**
   * Get facilities count by type
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Array>} Count of facilities by type
   */
  async getFacilitiesCountByType(zipcode) {
    try {
      const query = await queryLoader.loadQuery('facilities-count-by-type', 'facilities');
      const result = await db.query(query, [zipcode]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getFacilitiesCountByType: ${error.message}`);
    }
  }

  /**
   * Get childcare facilities by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of childcare facilities
   */
  async getChildcareByCity(city, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('childcare-by-city', 'facilities');
      const result = await db.query(query, [`%${city}%`, limit]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getChildcareByCity: ${error.message}`);
    }
  }
}

module.exports = new FacilitiesRepository(); 