const db = require('../config/database');
const queryLoader = require('../utils/queryLoader');

/**
 * Analytics Repository
 * Handles all database operations for analytics data
 */
class AnalyticsRepository {
  /**
   * Get average childcare centers by criteria
   * @param {string} city - City name
   * @param {number} minRating - Minimum rating filter
   * @returns {Promise<Object>} Childcare statistics
   */
  async getAverageChildcareByCriteria(city, minRating = 0) {
    try {
      const query = await queryLoader.loadQuery('average-childcare-by-criteria', 'analytics');
      const result = await db.query(query, [`%${city}%`, minRating]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getAverageChildcareByCriteria: ${error.message}`);
    }
  }

  /**
   * Get facilities count by type for a zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Array>} Count of facilities by type
   */
  async getFacilitiesCountByType(zipcode) {
    try {
      const query = await queryLoader.loadQuery('facilities-count-by-type', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getFacilitiesCountByType: ${error.message}`);
    }
  }

  /**
   * Get population data by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Population data
   */
  async getPopulationByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('population-by-zipcode', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getPopulationByZipcode: ${error.message}`);
    }
  }

  /**
   * Get health measures by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Health measures data
   */
  async getHealthMeasuresByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('health-measures-by-zipcode', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getHealthMeasuresByZipcode: ${error.message}`);
    }
  }

  /**
   * Get comprehensive analytics by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Comprehensive analytics data
   */
  async getComprehensiveAnalyticsByZipcode(zipcode) {
    try {
      // Get all data in parallel
      const [facilitiesCount, population, healthMeasures, realEstateStats] = await Promise.all([
        this.getFacilitiesCountByType(zipcode),
        this.getPopulationByZipcode(zipcode),
        this.getHealthMeasuresByZipcode(zipcode),
        this.getRealEstateStatsByZipcode(zipcode)
      ]);

      return {
        zipcode,
        facilitiesCount,
        population,
        healthMeasures,
        realEstateStats
      };
    } catch (error) {
      throw new Error(`Database error in getComprehensiveAnalyticsByZipcode: ${error.message}`);
    }
  }

  /**
   * Get real estate statistics by zipcode
   * @param {string} zipcode - ZIP code to search
   * @returns {Promise<Object>} Real estate statistics
   */
  async getRealEstateStatsByZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('real-estate-stats-by-zipcode', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getRealEstateStatsByZipcode: ${error.message}`);
    }
  }

  /**
   * Get city comparison data
   * @param {Array} cities - Array of city names
   * @returns {Promise<Array>} City comparison data
   */
  async getCityComparisonData(cities) {
    try {
      const query = await queryLoader.loadQuery('city-comparison-data', 'analytics');
      const result = await db.query(query, [cities]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getCityComparisonData: ${error.message}`);
    }
  }

  /**
   * Get top facilities by rating
   * @param {string} facilityType - Type of facility
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Top facilities
   */
  async getTopFacilitiesByRating(facilityType, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('top-facilities-by-rating', 'analytics');
      const result = await db.query(query, [facilityType, limit]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getTopFacilitiesByRating: ${error.message}`);
    }
  }

  /**
   * Validate if zipcode has analytics data
   * @param {string} zipcode - ZIP code to validate
   * @returns {Promise<boolean>} True if zipcode has analytics data
   */
  async validateZipcode(zipcode) {
    try {
      const query = await queryLoader.loadQuery('validate-zipcode', 'analytics');
      const result = await db.query(query, [zipcode]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw new Error(`Database error in validateZipcode: ${error.message}`);
    }
  }

  /**
   * Get underserved ZIP codes based on facility density
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of underserved ZIP codes
   */
  async getUnderservedZipcodes(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('underserved-zipcodes', 'analytics');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getUnderservedZipcodes: ${error.message}`);
    }
  }

  /**
   * Get growth leaders based on real estate price trends
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of growth leader data
   */
  async getGrowthLeaders(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('growth-leaders', 'analytics');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getGrowthLeaders: ${error.message}`);
    }
  }

  /**
   * Get hospital distance analysis by price tier
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of hospital distance data
   */
  async getHospitalDistanceByPrice(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('hospital-distance-by-price', 'analytics');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getHospitalDistanceByPrice: ${error.message}`);
    }
  }

  /**
   * Get safety to sale ratio analysis
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of safety to sale ratio data
   */
  async getSafetyToSaleRatio(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('safety-sale-ratio', 'analytics');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getSafetyToSaleRatio: ${error.message}`);
    }
  }

  /**
   * Get affordable ZIP codes
   * @param {number} maxPrice - Maximum price threshold
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of affordable ZIP codes
   */
  async getAffordableZipcodes(maxPrice = 300000, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('affordable-zipcodes', 'analytics');
      const result = await db.query(query, [maxPrice, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAffordableZipcodes: ${error.message}`);
    }
  }

  /**
   * Get underserved healthcare analysis
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of underserved healthcare data
   */
  async getUnderservedHealthcare(limit = 10) {
    try {
      const query = await queryLoader.loadQuery('underserved-healthcare', 'analytics');
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getUnderservedHealthcare: ${error.message}`);
    }
  }

  /**
   * Get facilities to population ratio for a specific zipcode
   * @param {string} zipcode - ZIP code to analyze
   * @returns {Promise<Object>} Facilities to population ratio data
   */
  async getFacilitiesToPopulation(zipcode) {
    try {
      const query = await queryLoader.loadQuery('facilities-to-population', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error in getFacilitiesToPopulation: ${error.message}`);
    }
  }

  /**
   * Get facilities to population ratio for all zipcodes in a city
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Aggregated facilities to population ratio data
   */
  async getFacilitiesToPopulationByCity(city, state) {
    try {
      const query = await queryLoader.loadQuery('facilities-to-population-by-city', 'analytics');
      const result = await db.query(query, [city, state]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error in getFacilitiesToPopulationByCity: ${error.message}`);
    }
  }

  /**
   * Get market trends analysis
   * @param {string} city - City name (optional)
   * @param {number} months - Number of months to analyze
   * @returns {Promise<Array>} Market trends data
   */
  async getMarketTrends(city, months = 6) {
    try {
      const query = await queryLoader.loadQuery('market-trends', 'analytics');
      const params = [`%${city}%`, months];
      const { logger } = require('../utils/logger');
      logger.debug('Executing market-trends SQL', { query, params });
      const result = await db.query(query, params);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getMarketTrends: ${error.message}`);
    }
  }

  /**
   * Get zipcode comparison analysis
   * @param {Array} zipcodes - Array of ZIP codes to compare
   * @returns {Promise<Array>} Zipcode comparison data
   */
  async getZipcodeComparison(zipcodes) {
    try {
      const query = await queryLoader.loadQuery('zipcode-comparison', 'analytics');
      const result = await db.query(query, [zipcodes]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getZipcodeComparison: ${error.message}`);
    }
  }

  /**
   * Get homepage featured ZIP codes with population >= 2000 that have both good social service resources and healthcare resources
   * @param {number} limit - Number of results to return (default: 4)
   * @returns {Promise<Array>} Array of featured ZIP codes with service level scores
   */
  async getHomepageFeaturedZipcodes(limit = 4) {
    try {
      const query = await queryLoader.loadQuery('homepage-featured-zipcodes', 'analytics');
      const result = await db.query(query, [limit]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getHomepageFeaturedZipcodes: ${error.message}`);
    }
  }

  /**
   * Get location page data for a specific ZIP code
   * @param {string} zipcode - ZIP code to get location data for
   * @returns {Promise<Object>} Location page data
   */
  async getLocationPageData(zipcode) {
    try {
      const query = await queryLoader.loadQuery('location-page-data', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getLocationPageData: ${error.message}`);
    }
  }

  /**
   * Get city-level aggregate comparison for hospitals, police, firefighters, income, population, and health data
   * @param {string} city - City name (case-insensitive)
   * @param {string} state - State abbreviation (case-insensitive)
   * @returns {Promise<Object>} City-level aggregate comparison data
   */
  async getCityAggregateComparison(city, state) {
    try {
      const query = await queryLoader.loadQuery('city-aggregate-comparison', 'analytics');
      const result = await db.query(query, [city, state]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getCityAggregateComparison: ${error.message}`);
    }
  }

  /**
   * Get city growth rate between 2022 and 2025
   * @param {string} city - City name (case-insensitive)
   * @param {string} state - State abbreviation (case-insensitive)
   * @returns {Promise<Object>} City growth rate data
   */
  async getCityGrowthRate(city, state) {
    try {
      const query = await queryLoader.loadQuery('city-growth-rate', 'analytics');
      const result = await db.query(query, [city, state]);
      return result && result.rows && result.rows[0] ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Database error in getCityGrowthRate: ${error.message}`);
    }
  }

  /**
   * Get the 4 most similar ZIP codes to a given ZIP code based on weighted attributes
   * @param {string} zipcode - ZIP code to find similar ZIP codes for
   * @returns {Promise<Array>} Array of similar ZIP codes with similarity scores
   */
  async getSimilarZipcodes(zipcode) {
    try {
      const query = await queryLoader.loadQuery('similar-zipcodes', 'analytics');
      const result = await db.query(query, [zipcode]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getSimilarZipcodes: ${error.message}`);
    }
  }

  /**
   * Get the 2 most similar cities to a given city based on weighted attributes
   * @param {string} city - City name to find similar cities for
   * @param {string} state - State abbreviation
   * @returns {Promise<Array>} Array of similar cities with similarity scores
   */
  async getSimilarCities(city, state) {
    try {
      const query = await queryLoader.loadQuery('similar-cities', 'analytics');
      const result = await db.query(query, [city, state]);
      return result && result.rows ? result.rows : [];
    } catch (error) {
      throw new Error(`Database error in getSimilarCities: ${error.message}`);
    }
  }

}

module.exports = new AnalyticsRepository(); 