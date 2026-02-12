const realEstateRepository = require("../repositories/realEstateRepository");
const { logger } = require("../utils/logger");
const { getCached, setCached } = require("../utils/redisCache");

/**
 * Real Estate Service
 * Handles business logic for real estate operations
 * Delegates data access to repository layer
 * Uses ResponseUtils for consistent response formatting
 */

class RealEstateService {
  /**
   * Get lowest home prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest prices
   */
  static async getLowestPrices(limit = 10) {
    const data = await realEstateRepository.getLowestMedianHomePrices(limit);
    return { success: true, data };
  }

  /**
   * Get highest home prices
   * @param {number} limit - Number of results to return
   * @param {string} dateMonth - Date month filter (YYYYMM format)
   * @returns {Promise<Object>} Formatted response with highest prices
   */
  static async getHighestPrices(limit = 10, dateMonth) {
    const data = await realEstateRepository.getHighestMedianHomePrices(
      limit,
      dateMonth
    );
    return { success: true, data };
  }

  /**
   * Get average property prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with average prices
   */
  static async getAveragePrices(limit = 10) {
    const data = await realEstateRepository.getAveragePropertyPrices(limit);
    return { success: true, data };
  }

  /**
   * Get prices by ZIP code range
   * @param {string} minZipcode - Minimum ZIP code
   * @param {string} maxZipcode - Maximum ZIP code
   * @returns {Promise<Object>} Formatted response with prices by ZIP code range
   */
  static async getPricesByZipcodeRange(minZipcode, maxZipcode) {
    const data = await realEstateRepository.getRealEstatePricesByZipcodeRange(
      minZipcode,
      maxZipcode
    );
    return { success: true, data };
  }

  /**
   * Get real estate statistics by ZIP code
   * @param {string} zipcode - ZIP code to get statistics for
   * @returns {Promise<Object>} Formatted response with real estate statistics
   */
  static async getStatisticsByZipcode(zipcode) {
    const data = await realEstateRepository.getRealEstateStatsByZipcode(
      zipcode
    );
    return { success: true, data };
  }

  /**
   * Get affordable housing options
   * @param {number} maxPrice - Maximum price filter
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with affordable housing options
   */
  static async getAffordableHousing(maxPrice = 300000, limit = 10) {
    const data = await realEstateRepository.getAffordableHousingOptions(
      maxPrice,
      limit
    );
    return { success: true, data };
  }

  /**
   * Get affordable ZIP codes by city and state
   * @param {number} maxPrice - Maximum price threshold
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with affordable ZIP codes
   */
  static async getAffordableZipCodesByCity(
    maxPrice = 300000,
    city,
    state,
    limit = 10
  ) {
    const data = await realEstateRepository.getAffordableZipCodesByCity(
      maxPrice,
      city,
      state,
      limit
    );
    return { success: true, data };
  }

  /**
   * Compare ZIP codes
   * @param {string} zipcode1 - First ZIP code
   * @param {string} zipcode2 - Second ZIP code
   * @returns {Promise<Object>} Formatted response with ZIP code comparison
   */
  static async compareZipcodes(zipcode1, zipcode2) {
    // TODO: Implement compareZipcodes in repository
    // For now, return empty data to avoid errors
    return { success: true, data: [] };
  }

  /**
   * Search properties with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Formatted response with search results
   */
  static async searchProperties(filters) {
    logger.debug("Entered realEstateService.searchProperties", { filters });
    try {
      const data = await realEstateRepository.searchProperties(filters);
      return { success: true, data };
    } catch (error) {
      logger.error("Error in realEstateService.searchProperties", {
        error: error.message,
        filters,
      });
      throw error;
    }
  }

  /**
   * Get price trends for a ZIP code
   * @param {string} zipcode - ZIP code to get trends for
   * @returns {Promise<Object>} Formatted response with price trends
   */
  static async getPriceTrends(zipcode) {
    const cacheKey = `price-trends:${zipcode}`;
    const redisCached = await getCached(cacheKey);
    if (redisCached) return redisCached;

    const data = await realEstateRepository.getPriceTrendsByZipcode(zipcode);
    const result = { success: true, data };
    await setCached(cacheKey, result);
    return result;
  }

  /**
   * Get luxury housing options
   * @param {number} minPrice - Minimum price filter
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with luxury housing options
   */
  static async getLuxuryHousing(minPrice = 500000, limit = 10) {
    const data = await realEstateRepository.getLuxuryHousingOptions(
      minPrice,
      limit
    );
    return { success: true, data };
  }

  /**
   * Get lowest median home prices
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest median home prices
   */
  static async getLowestMedianHomePrices(limit = 10) {
    const data = await realEstateRepository.getLowestMedianHomePrices(limit);
    return { success: true, data };
  }

  /**
   * Get highest median home prices
   * @param {number} limit - Number of results to return
   * @param {string} dateMonth - Date month filter (YYYYMM format)
   * @returns {Promise<Object>} Formatted response with highest median home prices
   */
  static async getHighestMedianHomePrices(limit = 10, dateMonth) {
    const data = await realEstateRepository.getHighestMedianHomePrices(
      limit,
      dateMonth
    );
    return { success: true, data };
  }

  /**
   * Get lowest home prices by city
   * @param {string} city - City name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with lowest home prices by city
   */
  static async getLowestHomePricesByCity(city, limit = 10) {
    const data = await realEstateRepository.getLowestHomePricesByCity(
      city,
      limit
    );
    return { success: true, data };
  }

  /**
   * Get average income by ZIP code
   * @param {string} zipcode - ZIP code to get income data for
   * @returns {Promise<Object>} Formatted response with average income
   */
  static async getAverageIncomeByZipcode(zipcode) {
    const data = await realEstateRepository.getAverageIncomeByZipcode(zipcode);
    return { success: true, data };
  }

  /**
   * Get lowest median home price ZIP code
   * @param {string} city - City name
   * @param {string} state - State name
   * @returns {Promise<Object>} Formatted response with lowest median home price ZIP code
   */
  static async getZipcodeWithLowestMedianHomePriceInCity(city, state) {
    const data =
      await realEstateRepository.getZipcodeWithLowestMedianHomePriceInCity(
        city,
        state
      );
    return { success: true, data };
  }

  /**
   * Get property count by city
   * @param {string} city - City name
   * @returns {Promise<Object>} Formatted response with property count by city
   */
  static async getPropertyCountByCity(city) {
    const data = await realEstateRepository.getPropertyCountByCity(city);
    return { success: true, data };
  }

  /**
   * Validate real estate parameters
   * @returns {boolean} True if valid
   */
  static validateRealEstateParams() {
    // Add validation logic here if needed
    return true;
  }

  /**
   * Validate if a ZIP code exists in the real estate data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if ZIP code exists in real estate data
   */
  static async validateZipcode(zipcode) {
    return realEstateRepository.validateZipcode(zipcode);
  }
}

module.exports = RealEstateService;
