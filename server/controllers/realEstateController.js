const realEstateService = require('../services/realEstateService');
const ResponseUtils = require('../utils/responseUtils');
const { logger } = require('../utils/logger');

/**
 * Real Estate Controller
 * Handles HTTP requests for real estate endpoints
 * Delegates business logic to service layer
 * Uses ResponseUtils for consistent response formatting
 */

class RealEstateController {
  /**
   * Get lowest home prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest prices
   */
  static async getLowestPrices(limit = 10) {
    try {
      const result = await realEstateService.getLowestPrices(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'lowest_prices', limit });
    } catch (error) {
      throw new Error(`Error getting lowest prices: ${error.message}`);
    }
  }

  /**
   * Get highest home prices
   * @param {number} limit - Number of results to return
   * @param {string} dateMonth - Date month filter (YYYYMM format)
   * @returns {Promise<Object>} Formatted response with highest prices
   */
  static async getHighestPrices(limit = 10, dateMonth) {
    try {
      const result = await realEstateService.getHighestPrices(limit, dateMonth);
      return ResponseUtils.formatSuccess(result.data, { type: 'highest_prices', limit, dateMonth });
    } catch (error) {
      throw new Error(`Error getting highest prices: ${error.message}`);
    }
  }

  /**
   * Get average property prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with average prices
   */
  static async getAveragePrices(limit = 10) {
    try {
      const result = await realEstateService.getAveragePrices(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'average_prices', limit });
    } catch (error) {
      throw new Error(`Error getting average prices: ${error.message}`);
    }
  }

  /**
   * Get prices by ZIP code range
   * @param {string} minZipcode - Minimum ZIP code
   * @param {string} maxZipcode - Maximum ZIP code
   * @returns {Promise<Object>} Formatted response with prices by ZIP code range
   */
  static async getPricesByZipcodeRange(minZipcode, maxZipcode) {
    try {
      const result = await realEstateService.getPricesByZipcodeRange(minZipcode, maxZipcode);
      return ResponseUtils.formatSuccess(result.data, { type: 'prices_by_zipcode_range', minZipcode, maxZipcode });
    } catch (error) {
      throw new Error(`Error getting prices by ZIP code range: ${error.message}`);
    }
  }

  /**
   * Get real estate statistics by ZIP code
   * @param {string} zipcode - ZIP code to get statistics for
   * @returns {Promise<Object>} Formatted response with real estate statistics
   */
  static async getStatisticsByZipcode(zipcode) {
    try {
      const result = await realEstateService.getStatisticsByZipcode(zipcode);
      return ResponseUtils.formatStatistics(result.data, zipcode);
    } catch (error) {
      throw new Error(`Error getting real estate statistics: ${error.message}`);
    }
  }

  /**
   * Get affordable housing options
   * @param {number} maxPrice - Maximum price filter
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with affordable housing options
   */
  static async getAffordableHousing(maxPrice = 300000, limit = 10) {
    try {
      const result = await realEstateService.getAffordableHousing(maxPrice, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'affordable_housing', maxPrice, limit });
    } catch (error) {
      throw new Error(`Error getting affordable housing: ${error.message}`);
    }
  }

  /**
   * Get affordable ZIP codes by city and state
   * @param {number} maxPrice - Maximum price threshold
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with affordable ZIP codes
   */
  static async getAffordableZipCodesByCity(maxPrice = 300000, city, state, limit = 10) {
    try {
      const result = await realEstateService.getAffordableZipCodesByCity(maxPrice, city, state, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'affordable_zipcodes', maxPrice, city, state, limit });
    } catch (error) {
      throw new Error(`Error getting affordable ZIP codes by city: ${error.message}`);
    }
  }

  /**
   * Compare ZIP codes
   * @param {string} zipcode1 - First ZIP code
   * @param {string} zipcode2 - Second ZIP code
   * @returns {Promise<Object>} Formatted response with ZIP code comparison
   */
  static async compareZipcodes(zipcode1, zipcode2) {
    try {
      const result = await realEstateService.compareZipcodes(zipcode1, zipcode2);
      return ResponseUtils.formatComparison(result.data, [zipcode1, zipcode2]);
    } catch (error) {
      throw new Error(`Error comparing ZIP codes: ${error.message}`);
    }
  }

  /**
   * Search properties with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Formatted response with search results
   */
  static async searchProperties(filters) {
    logger.debug('Entered realEstateController.searchProperties', { filters });
    try {
      const result = await realEstateService.searchProperties(filters);
      return ResponseUtils.formatSuccess(result.data, { type: 'property_search', filters });
    } catch (error) {
      logger.error('Error in searchProperties controller', { error: error.message, filters });
      throw new Error(`Error searching properties: ${error.message}`);
    }
  }

  /**
   * Get price trends for a ZIP code
   * @param {string} zipcode - ZIP code to get trends for
   * @returns {Promise<Object>} Formatted response with price trends
   */
  static async getPriceTrends(zipcode) {
    try {
      const result = await realEstateService.getPriceTrends(zipcode);
      return ResponseUtils.formatSuccess(result.data, { type: 'price_trends', zipcode });
    } catch (error) {
      throw new Error(`Error getting price trends: ${error.message}`);
    }
  }

  /**
   * Get luxury housing options
   * @param {number} minPrice - Minimum price filter
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with luxury housing options
   */
  static async getLuxuryHousing(minPrice = 500000, limit = 10) {
    try {
      const result = await realEstateService.getLuxuryHousing(minPrice, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'luxury_housing', minPrice, limit });
    } catch (error) {
      throw new Error(`Error getting luxury housing: ${error.message}`);
    }
  }

  /**
   * Get lowest median home prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest median home prices
   */
  static async getLowestMedianHomePrices(limit = 10) {
    try {
      const result = await realEstateService.getLowestMedianHomePrices(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'lowest_median_home_prices', limit });
    } catch (error) {
      throw new Error(`Error getting lowest median home prices: ${error.message}`);
    }
  }

  /**
   * Get highest median home prices
   * @param {number} limit - Number of results to return
   * @param {string} dateMonth - Date month filter (YYYYMM format)
   * @returns {Promise<Object>} Formatted response with highest median home prices
   */
  static async getHighestMedianHomePrices(limit = 10, dateMonth) {
    try {
      const result = await realEstateService.getHighestMedianHomePrices(limit, dateMonth);
      return ResponseUtils.formatSuccess(result.data, { type: 'highest_median_home_prices', limit, dateMonth });
    } catch (error) {
      throw new Error(`Error getting highest median home prices: ${error.message}`);
    }
  }

  /**
   * Get lowest home prices by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest home prices by city
   */
  static async getLowestHomePricesByCity(city, limit = 10) {
    try {
      const result = await realEstateService.getLowestHomePricesByCity(city, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'lowest_home_prices_by_city', city, limit });
    } catch (error) {
      throw new Error(`Error getting lowest home prices by city: ${error.message}`);
    }
  }

  /**
   * Get average income by ZIP code
   * @param {string} zipcode - ZIP code to get income data for
   * @returns {Promise<Object>} Formatted response with average income
   */
  static async getAverageIncomeByZipcode(zipcode) {
    try {
      const result = await realEstateService.getAverageIncomeByZipcode(zipcode);
      return ResponseUtils.formatSuccess(result.data, { type: 'average_income_by_zipcode', zipcode });
    } catch (error) {
      throw new Error(`Error getting average income by ZIP code: ${error.message}`);
    }
  }

  /**
   * Get lowest median home price ZIP code
   * @param {string} city - City name
   * @returns {Promise<Object>} Formatted response with lowest median home price ZIP code
   */
  static async getZipcodeWithLowestMedianHomePriceInCity(city, state) {
    try {
      const result = await realEstateService.getZipcodeWithLowestMedianHomePriceInCity(city, state);
      
      // Check if data is null or empty and provide appropriate message
      const message = !result.data || (Array.isArray(result.data) && result.data.length === 0) 
        ? 'No median home price data found' 
        : 'Lowest median home price ZIP code retrieved successfully';
      
      return ResponseUtils.formatSuccess(result.data, { 
        type: 'lowest_median_home_price_zipcode', 
        city,
        message 
      });
    } catch (error) {
      throw new Error(`Error getting lowest median home price ZIP code: ${error.message}`);
    }
  }

  /**
   * Get property count by city
   * @param {string} city - City name
   * @returns {Promise<Object>} Formatted response with property count by city
   */
  static async getPropertyCountByCity(city) {
    try {
      const result = await realEstateService.getPropertyCountByCity(city);
      return ResponseUtils.formatSuccess(result.data, { type: 'property_count_by_city', city });
    } catch (error) {
      throw new Error(`Error getting property count by city: ${error.message}`);
    }
  }

  /**
   * Validate real estate parameters
   * @param {Object} params - Parameters to validate
   * @returns {boolean} True if valid
   */
  static validateRealEstateParams(params) {
    return realEstateService.validateRealEstateParams(params);
  }

  /**
   * Validate if a ZIP code exists in the real estate data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if ZIP code exists in real estate data
   */
  static async validateZipcode(zipcode) {
    try {
      const isValid = await realEstateService.validateZipcode(zipcode);
      return isValid;
    } catch (error) {
      throw new Error(`Error validating real estate ZIP code: ${error.message}`);
    }
  }

  /**
   * Error handler for real estate routes
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static handleError(error, req, res) {
    // logger.error('Real estate controller error', {
    //   method: req.method,
    //   url: req.originalUrl,
    //   error: error.message,
    //   stack: error.stack
    // });

    res.status(500).json(ResponseUtils.formatError('Internal server error', 500));
  }
}

module.exports = RealEstateController; 