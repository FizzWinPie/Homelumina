const analyticsService = require('../services/analyticsService');
const ResponseUtils = require('../utils/responseUtils');

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints
 * Delegates business logic to service layer
 * Uses ResponseUtils for consistent response formatting
 */

class AnalyticsController {
  /**
   * Get underserved ZIP codes based on facility density
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with underserved ZIP codes
   */
  static async getUnderservedZipcodes(limit = 10) {
    try {
      const result = await analyticsService.getUnderservedZipcodes(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'underserved_zipcodes', limit });
    } catch (error) {
      throw new Error(`Error getting underserved ZIP codes: ${error.message}`);
    }
  }

  /**
   * Get growth leaders based on real estate price trends
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with growth leaders
   */
  static async getGrowthLeaders(limit = 10) {
    try {
      const result = await analyticsService.getGrowthLeaders(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'growth_leaders', limit });
    } catch (error) {
      throw new Error(`Error getting growth leaders: ${error.message}`);
    }
  }

  /**
   * Get hospital distance analysis by price tier
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with hospital distance analysis
   */
  static async getHospitalDistanceByPrice(limit = 10) {
    try {
      const result = await analyticsService.getHospitalDistanceByPrice(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'hospital_distance_analysis', limit });
    } catch (error) {
      throw new Error(`Error getting hospital distance by price: ${error.message}`);
    }
  }

  /**
   * Get safety to sale ratio analysis
   * @param {string} city - City name (optional)
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with safety to sale ratio
   */
  static async getSafetyToSaleRatio(city, limit = 10) {
    try {
      const result = await analyticsService.getSafetyToSaleRatio(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'safety_to_sale_ratio', city, limit });
    } catch (error) {
      throw new Error(`Error getting safety to sale ratio: ${error.message}`);
    }
  }

  /**
   * Get affordable ZIP codes
   * @param {number} maxPrice - Maximum price threshold
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with affordable ZIP codes
   */
  static async getAffordableZipcodes(maxPrice = 300000, limit = 20) {
    try {
      const result = await analyticsService.getAffordableZipcodes(maxPrice, limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'affordable_zipcodes', maxPrice, limit });
    } catch (error) {
      throw new Error(`Error getting affordable ZIP codes: ${error.message}`);
    }
  }

  /**
   * Get underserved healthcare analysis
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with underserved healthcare analysis
   */
  static async getUnderservedHealthcare(limit = 10) {
    try {
      const result = await analyticsService.getUnderservedHealthcare(limit);
      return ResponseUtils.formatSuccess(result.data, { type: 'underserved_healthcare', limit });
    } catch (error) {
      throw new Error(`Error getting underserved healthcare: ${error.message}`);
    }
  }

  /**
   * Format analytics response
   * @param {Array} data - Raw data from database
   * @param {string} type - Type of analytics
   * @returns {Object} Formatted response
   */
  static formatAnalyticsResponse(data, type) {
    return ResponseUtils.formatSuccess(data, type);
  }

  /**
   * Get facilities to population ratio analysis
   * @param {string} zipcode - ZIP code to analyze
   * @returns {Promise<Object>} Formatted response with facilities to population ratio
   */
  static async getFacilitiesToPopulation(zipcode) {
    try {
      const result = await analyticsService.getFacilitiesToPopulation(zipcode);
      return ResponseUtils.formatStatistics(result.data, zipcode);
    } catch (error) {
      throw new Error(`Error getting facilities to population ratio: ${error.message}`);
    }
  }

  /**
   * Get facilities to population ratio analysis (non-hyphenated endpoint)
   * @param {string} zipcode - ZIP code to analyze
   * @returns {Promise<Object>} Formatted response with facilities to population ratio
   */
  static async getFacilitiesToPopulationRatio(zipcode) {
    try {
      const result = await analyticsService.getFacilitiesToPopulation(zipcode);
      return ResponseUtils.formatStatistics(result.data, zipcode);
    } catch (error) {
      throw new Error(`Error getting facilities to population ratio: ${error.message}`);
    }
  }

  /**
   * Get market trends analysis
   * @param {string} city - City name (optional)
   * @param {number} months - Number of months to analyze
   * @returns {Promise<Object>} Formatted response with market trends
   */
  static async getMarketTrends(city, months = 6) {
    try {
      const result = await analyticsService.getMarketTrends(city, months);
      return ResponseUtils.formatSuccess(result.data, { type: 'market_trends', city, months });
    } catch (error) {
      throw new Error(`Error getting market trends: ${error.message}`);
    }
  }

  /**
   * Get zipcode comparison analysis
   * @param {string} zipcodes - Comma-separated list of ZIP codes
   * @returns {Promise<Object>} Formatted response with zipcode comparison
   */
  static async getZipcodeComparison(zipcodes) {
    try {
      const result = await analyticsService.getZipcodeComparison(zipcodes);
      return ResponseUtils.formatComparison(result.data, zipcodes);
    } catch (error) {
      throw new Error(`Error getting zipcode comparison: ${error.message}`);
    }
  }

  /**
   * Validate analytics parameters
   * @param {Object} params - Parameters to validate
   * @returns {boolean} True if valid
   */
  static validateAnalyticsParams(params) {
    return analyticsService.validateAnalyticsParams(params);
  }

  /**
   * Get homepage featured ZIP codes with population >= 2000 that have both good social service resources and healthcare resources
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with featured ZIP codes
   */
  static async getHomepageFeaturedZipcodes(limit = 4) {
    try {
      const result = await analyticsService.getHomepageFeaturedZipcodes(limit);
      if (result && result.success === false) {
        return result;
      }
      if (result && result.success === true && result.data === null) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, { 
        type: 'homepage_featured_zipcodes', 
        limit
      });
    } catch (error) {
      throw new Error(`Error getting homepage featured ZIP codes: ${error.message}`);
    }
  }

  /**
   * Get location page data for a specific ZIP code
   * @param {string} zipcode - ZIP code to get location data for
   * @returns {Promise<Object>} Formatted response with location page data
   */
  static async getLocationPageData(zipcode) {
    try {
      // Delegate to service layer
      const result = await analyticsService.getLocationPageData(zipcode);
      return ResponseUtils.formatSuccess(result.data, 'location_page_data');
    } catch (error) {
      throw new Error(`Error fetching location page data: ${error.message}`);
    }
  }

  /**
   * Get city-level aggregate comparison for hospitals, police, firefighters, income, population, and health data
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Formatted response with city-level aggregate comparison
   */
  static async getCityAggregateComparison(city, state) {
    try {
      const result = await analyticsService.getCityAggregateComparison(city, state);
      if (result && result.success === false) {
        return result;
      }
      if (result && result.success === true && result.data === null) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, 'city_aggregate_comparison');
    } catch (error) {
      throw new Error(`Error fetching city aggregate comparison: ${error.message}`);
    }
  }

  /**
   * Get city growth rate between 2022 and 2025
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Formatted response with city growth rate
   */
  static async getCityGrowthRate(city, state) {
    try {
      const result = await analyticsService.getCityGrowthRate(city, state);
      // If no data found, return as is (success: true, data: null)
      if (result && result.success === true && result.data === null) {
        return result;
      }
      // If service returned success: false, propagate
      if (result && result.success === false) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, 'city_growth_rate');
    } catch (error) {
      throw new Error(`Error fetching city growth rate: ${error.message}`);
    }
  }

  /**
   * Get the 4 most similar ZIP codes to a given ZIP code based on weighted attributes
   * @param {string} zipcode - ZIP code to find similar ZIP codes for
   * @returns {Promise<Object>} Formatted response with similar ZIP codes
   */
  static async getSimilarZipcodes(zipcode) {
    try {
      const result = await analyticsService.getSimilarZipcodes(zipcode);
      // If no data found, return as is (success: true, data: null)
      if (result && result.success === true && result.data === null) {
        return result;
      }
      if (result && result.success === false) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, 'similar_zipcodes');
    } catch (error) {
      throw new Error(`Error fetching similar ZIP codes: ${error.message}`);
    }
  }

  /**
   * Get the 2 most similar cities to a given city based on weighted attributes
   * @param {string} city - City name to find similar cities for
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Formatted response with similar cities
   */
  static async getSimilarCities(city, state) {
    try {
      const result = await analyticsService.getSimilarCities(city, state);
      // If no data found, return as is (success: true, data: null)
      if (result && result.success === true && result.data === null) {
        return result;
      }
      if (result && result.success === false) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, 'similar_cities');
    } catch (error) {
      throw new Error(`Error fetching similar cities: ${error.message}`);
    }
  }

  /**
   * Get facilities count by type for a ZIP code
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Formatted response with facilities count
   */
  static async getFacilitiesCountByType(zipcode) {
    try {
      const result = await analyticsService.getFacilitiesCountByType(zipcode);
      return ResponseUtils.formatSuccess(result.data, { type: 'facilities_count', zipcode });
    } catch (error) {
      throw new Error(`Error getting facilities count: ${error.message}`);
    }
  }

  /**
   * Get facilities to population ratio for all zipcodes in a city
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Formatted response with facilities to population ratio
   */
  static async getFacilitiesToPopulationByCity(city, state) {
    try {
      const result = await analyticsService.getFacilitiesToPopulationByCity(city, state);
      if (result && result.success === false) {
        return result;
      }
      if (result && result.success === true && result.data === null) {
        return result;
      }
      return ResponseUtils.formatSuccess(result.data, { type: 'facilities_to_population_by_city', city, state });
    } catch (error) {
      throw new Error(`Error getting facilities to population ratio by city: ${error.message}`);
    }
  }

}

module.exports = AnalyticsController; 