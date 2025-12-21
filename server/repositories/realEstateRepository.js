const db = require('../config/database');
const queryLoader = require('../utils/queryLoader');
const { logger } = require('../utils/logger');

/**
 * Real Estate Repository
 * Handles all database operations for real estate data
 */
class RealEstateRepository {
  /**
   * Get lowest home prices by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of real estate data
   */
  async getLowestHomePricesByCity(city, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('lowest-home-prices-by-city', 'real-estate');
      const result = await db.query(query, [`%${city}%`, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getLowestHomePricesByCity: ${error.message}`);
    }
  }

  /**
   * Get real estate statistics by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Real estate statistics
   */
  async getRealEstateStatsByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('real-estate-stats-by-zipcode', 'real-estate');
      const result = await db.query(query, [zipcode]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error in getRealEstateStatsByZipcode: ${error.message}`);
    }
  }

  /**
   * Search properties by multiple criteria (localmarket only)
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.zipcode - ZIP code filter
   * @param {number} criteria.minPrice - Minimum price filter
   * @param {number} criteria.maxPrice - Maximum price filter
   * @param {number} criteria.limit - Result limit
   * @returns {Promise<Array>} Array of properties
   */
  async searchProperties(criteria) {
    logger.debug('Entered realEstateRepository.searchProperties', { criteria });
    const { 
      zipcode, 
      minPrice = 0, 
      maxPrice = 999999999, 
      limit = 10 
    } = criteria;

    try {
      logger.debug('Loading search properties query');
      const query = await queryLoader.loadQuery('search-properties', 'real-estate');
      logger.debug('Executing search properties query');
      
      // Prepare parameters - use NULL for optional parameters that aren't provided
      const params = [
        zipcode || null,
        minPrice > 0 ? minPrice : null,
        maxPrice < 999999999 ? maxPrice : null,
        limit
      ];

      const result = await db.query(query, params);
      logger.debug('Search properties query completed', { rowCount: result.rows?.length || 0 });
      // Defensive: handle both {rows: ...} and array return values
      const rows = Array.isArray(result) ? result : result.rows;
      logger.debug('Search properties rows processed', { rowCount: rows.length });
      return rows;
    } catch (error) {
      logger.error('Error in realEstateRepository.searchProperties', { error: error.message, criteria });
      throw new Error(`Database error in searchProperties: ${error.message}`);
    }
  }

  /**
   * Get average income by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Income data
   */
  async getAverageIncomeByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('average-income-by-zipcode', 'real-estate');
      const result = await db.query(query, [zipcode]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error in getAverageIncomeByZipcode: ${error.message}`);
    }
  }

  /**
   * Get property count by city
   * @param {string} city - City name
   * @returns {Promise<Object>} Property count data
   */
  async getPropertyCountByCity(city) {
    try {
      const query = await queryLoader.loadQuery('property-count-by-city', 'real-estate');
      const result = await db.query(query, [`%${city}%`]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error in getPropertyCountByCity: ${error.message}`);
    }
  }

  /**
   * Validate if zipcode has real estate data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if zipcode has real estate data
   */
  async validateZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('validate-zipcode', 'real-estate');
      const result = await db.query(query, [zipcode]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw new Error(`Database error in validateZipcode: ${error.message}`);
    }
  }

  /**
   * Get lowest median home prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of lowest price data
   */
  async getLowestMedianHomePrices(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('lowest-median-home-prices', 'real-estate');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getLowestMedianHomePrices: ${error.message}`);
    }
  }

  /**
   * Get highest median home prices
   * @param {number} limit - Number of results to return
   * @param {string} monthdate - Optional date/month filter (YYYYMM format)
   * @returns {Promise<Array>} Array of highest price data
   */
  async getHighestMedianHomePrices(limit = 10, monthdate = null) {
    try {
      const query = await queryLoader.loadQuery('highest-median-home-prices', 'real-estate');
      const result = await db.query(query, [limit, monthdate]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getHighestMedianHomePrices: ${error.message}`);
    }
  }

  /**
   * Get real estate prices by zipcode range
   * @param {string} minZipcode - Minimum ZIP code
   * @param {string} maxZipcode - Maximum ZIP code
   * @returns {Promise<Array>} Array of real estate prices in range
   */
  async getRealEstatePricesByZipcodeRange(minZipcode, maxZipcode) {
    try {
      const query = await queryLoader.loadQuery('real-estate-prices-by-zipcode-range', 'real-estate');
      const result = await db.query(query, [minZipcode, maxZipcode]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getRealEstatePricesByZipcodeRange: ${error.message}`);
    }
  }

  /**
   * Get price trends by zipcode
   * @param {string} zipcode - ZIP code to analyze
   * @returns {Promise<Array>} Array of price trends
   */
  async getPriceTrendsByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('price-trends-by-zipcode', 'real-estate');
      const result = await db.query(query, [zipcode]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getPriceTrendsByZipcode: ${error.message}`);
    }
  }

  /**
   * Get affordable housing options
   * @param {number} maxPrice - Maximum price threshold
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of affordable housing options
   */
  async getAffordableHousingOptions(maxPrice = 300000, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('affordable-housing-options', 'real-estate');
      const result = await db.query(query, [maxPrice, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAffordableHousingOptions: ${error.message}`);
    }
  }

  /**
   * Get affordable ZIP codes
   * @param {number} maxPrice - Maximum price threshold
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of affordable ZIP codes
   */
  async getAffordableZipCodes(maxPrice = 300000, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('affordable-zipcodes', 'real-estate');
      const result = await db.query(query, [maxPrice, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAffordableZipCodes: ${error.message}`);
    }
  }

  /**
   * Get affordable ZIP codes by city and state
   * @param {number} maxPrice - Maximum price threshold
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of affordable ZIP codes
   */
  async getAffordableZipCodesByCity(maxPrice = 300000, city, state, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('affordable-zipcodes-by-city', 'real-estate');
      const result = await db.query(query, [maxPrice, city, state, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAffordableZipCodesByCity: ${error.message}`);
    }
  }

  /**
   * Get luxury housing options
   * @param {number} minPrice - Minimum price threshold
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of luxury housing options
   */
  async getLuxuryHousingOptions(minPrice = 1000000, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('luxury-housing-options', 'real-estate');
      const result = await db.query(query, [minPrice, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getLuxuryHousingOptions: ${error.message}`);
    }
  }

  /**
   * Get average property prices by area
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of average price data
   */
  async getAveragePropertyPrices(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('average-property-prices', 'real-estate');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAveragePropertyPrices: ${error.message}`);
    }
  }

  /**
   * Get the zipcode with the lowest median home price in a city
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Zipcode with lowest median home price
   */
  async getZipcodeWithLowestMedianHomePriceInCity(city, state) {
    try {
      const query = await queryLoader.loadQuery('lowest-median-home-price-zipcode', 'real-estate');
      const result = await db.query(query, [city, state]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Database error in getZipcodeWithLowestMedianHomePriceInCity: ${error.message}`);
    }
  }
}

module.exports = new RealEstateRepository(); 