const searchService = require('../services/searchService');
const ResponseUtils = require('../utils/responseUtils');

/**
 * Search Controller
 * Handles HTTP layer for search operations
 */
class SearchController {
  /**
   * Get autocomplete suggestions
   * @param {string} searchTerm - Search term to match against
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with suggestions
   */
  static async getAutocompleteSuggestions(searchTerm, limit = 10) {
    try {
      const result = await searchService.getAutocompleteSuggestions(searchTerm, limit);
      return ResponseUtils.formatSuccess({
        suggestions: result.data
      }, 'autocomplete_suggestions', {
        searchTerm,
        limit,
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getAutocompleteSuggestions: ${error.message}`);
    }
  }

  /**
   * Get featured cities
   * @param {number} limit - Number of cities to return
   * @returns {Promise<Object>} Formatted response with featured cities
   */
  static async getFeaturedCities(limit = 3) {
    try {
      const result = await searchService.getFeaturedCities(limit);
      return ResponseUtils.formatSuccess({
        cities: result.data
      }, 'featured_cities', {
        limit,
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getFeaturedCities: ${error.message}`);
    }
  }

  /**
   * Get location-based featured cities
   * @param {string} userCity - User's city from IP geolocation
   * @param {string} userState - User's state from IP geolocation
   * @param {number} limit - Number of cities to return
   * @returns {Promise<Object>} Formatted response with location-based featured cities
   */
  static async getLocationBasedFeaturedCities(userCity, userState, limit = 3) {
    try {
      const result = await searchService.getLocationBasedFeaturedCities(userCity, userState, limit);
      return ResponseUtils.formatSuccess({
        cities: result.data,
        userLocation: { city: userCity, state: userState }
      }, 'location_based_featured_cities', {
        limit,
        totalCount: result.data.length,
        userCity,
        userState
      });
    } catch (error) {
      throw new Error(`Controller error in getLocationBasedFeaturedCities: ${error.message}`);
    }
  }

  /**
   * Get default featured cities for non-US users
   * @param {number} limit - Number of cities to return
   * @returns {Promise<Object>} Formatted response with default featured cities
   */
  static async getDefaultFeaturedCitiesForNonUS(limit = 3) {
    try {
      const result = await searchService.getFeaturedCities(limit);
      return ResponseUtils.formatSuccess({
        cities: result.data,
        userLocation: { country: 'Non-US' }
      }, 'default_featured_cities_non_us', {
        limit,
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getDefaultFeaturedCitiesForNonUS: ${error.message}`);
    }
  }

  /**
   * Get ZIP codes by city and state
   * @param {string} city - City name
   * @param {string} state - State name
   * @returns {Promise<Object>} Formatted response with ZIP codes
   */
  static async getZipcodesByCityState(city, state) {
    try {
      const result = await searchService.getZipcodesByCityState(city, state);
      return ResponseUtils.formatSuccess(result.data, 'zipcodes_by_city_state', {
        city,
        state,
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getZipcodesByCityState: ${error.message}`);
    }
  }

  /**
   * Get cities by state
   * @param {string} state - State name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with cities
   */
  static async getCitiesByState(state, limit = 20) {
    try {
      const result = await searchService.getCitiesByState(state, limit);
      return ResponseUtils.formatSuccess(result.data, 'cities_by_state', {
        state,
        limit,
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getCitiesByState: ${error.message}`);
    }
  }

  /**
   * Get all states
   * @returns {Promise<Object>} Formatted response with states
   */
  static async getAllStates() {
    try {
      const result = await searchService.getAllStates();
      return ResponseUtils.formatSuccess(result.data, 'all_states', {
        totalCount: result.data.length
      });
    } catch (error) {
      throw new Error(`Controller error in getAllStates: ${error.message}`);
    }
  }

  /**
   * Search ZIP codes with comprehensive summary data and multiple filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Formatted response with ZIP code summaries
   */
  static async searchZipcodeSummaries(filters) {
    try {
      const result = await searchService.getZipcodeSummaries(filters);
      
      // If there's a suggestion (no results found), return a special response
      if (result.suggestion) {
        return {
          success: true,
          data: [],
          suggestion: result.suggestion,
          type: 'zipcode_summaries',
          metadata: {
            filters: filters,
            totalCount: 0,
            message: 'No results found'
          }
        };
      }
      
      return ResponseUtils.formatSuccess(result.data, { 
        type: 'zipcode_summaries', 
        filters: filters,
        totalCount: result.data ? result.data.length : 0
      });
    } catch (error) {
      logger.error('SearchController error:', error);
      if (error.name === 'ValidationError') {
        // Return a formatted 400 error
        return ResponseUtils.formatError(error.message, 400, 'search/zipcode-summaries', filters);
      }
      // Return a formatted 500 error instead of throwing
      return ResponseUtils.formatError(`Error searching ZIP code summaries: ${error.message}`, 500, 'search/zipcode-summaries', filters);
    }
  }



  /**
   * Format search response with additional metadata
   * @param {Object} data - Response data
   * @param {string} type - Response type
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted response
   */
  static formatSearchResponse(data, type, metadata = {}) {
    return {
      success: true,
      data: data,
      type: type,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = SearchController; 