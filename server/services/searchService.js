const searchRepository = require('../repositories/searchRepository');

/**
 * Search Service
 * Handles business logic for search operations
 * Delegates data access to repository layer
 * Uses ResponseUtils for consistent response formatting
 */

class SearchService {
  /**
   * Get featured cities
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with featured cities
   */
  static async getFeaturedCities(limit = 3) {
    const data = await searchRepository.getFeaturedCities(limit);
    return { success: true, data };
  }

  /**
   * Get location-based featured cities
   * @param {string} userCity - User's city from IP geolocation
   * @param {string} userState - User's state from IP geolocation
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with location-based featured cities
   */
  static async getLocationBasedFeaturedCities(userCity, userState, limit = 3) {
    const data = await searchRepository.getLocationBasedFeaturedCities(userCity, userState, limit);
    return { success: true, data };
  }

  /**
   * Get autocomplete suggestions
   * @param {string} term - Search term
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with autocomplete suggestions
   */
  static async getAutocompleteSuggestions(term, limit = 10) {
    const data = await searchRepository.getAutocompleteSuggestions(term, limit);
    return { success: true, data };
  }

  /**
   * Get ZIP code summaries
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Formatted response with ZIP code summaries
   */
  static async getZipcodeSummaries(filters) {
    const result = await searchRepository.searchZipcodeSummaries(filters);
    
    // Handle the new response format with suggestions
    if (result.suggestion) {
      return { 
        success: true, 
        data: result.rows,
        suggestion: result.suggestion,
        metadata: {
          totalCount: 0,
          filters: filters
        }
      };
    }
    
    return { 
      success: true, 
      data: result.rows,
      metadata: {
        totalCount: result.rows.length,
        filters: filters
      }
    };
  }

  /**
   * Get ZIP codes by city and state
   * @param {string} city - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object>} Formatted response with ZIP codes
   */
  static async getZipcodesByCityState(city, state) {
    const data = await searchRepository.getZipcodesByCityState(city, state);
    return { success: true, data };
  }

  /**
   * Get cities by state
   * @param {string} state - State abbreviation
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} Formatted response with cities
   */
  static async getCitiesByState(state, limit = 20) {
    const data = await searchRepository.getCitiesByState(state, limit);
    return { success: true, data };
  }

  /**
   * Get all states
   * @returns {Promise<Object>} Formatted response with all states
   */
  static async getAllStates() {
    const data = await searchRepository.getAllStates();
    return { success: true, data };
  }

  /**
   * Validate search parameters
   * @returns {boolean} True if valid
   */
  static validateSearchParams() {
    // Add validation logic here if needed
    return true;
  }
}

module.exports = SearchService; 