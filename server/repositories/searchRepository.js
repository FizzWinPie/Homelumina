const db = require('../config/database');
const queryLoader = require('../utils/queryLoader');
const { logger } = require('../utils/logger');
const featuredCitiesCache = require('../utils/featuredCitiesCache');

// Get configurable default limit from environment
const DEFAULT_CITIES_LIMIT = parseInt(process.env.DEFAULT_CITIES_LIMIT) || 3;

/**
 * Search Repository
 * Handles database operations for search functionality
 */
class SearchRepository {
  /**
   * Get autocomplete suggestions for ZIP codes, cities, and states
   * @param {string} searchTerm - Search term to match against
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of search suggestions
   */
  async getAutocompleteSuggestions(searchTerm, limit = 10) {
    try {
      const query = await queryLoader.loadQuery('autocomplete-suggestions', 'search');
      const result = await db.query(query, [
        `${searchTerm}%`,           // ZIP code prefix match
        `%${searchTerm}%`,          // City, State contains match
        `%${searchTerm}%`,          // State contains match
        limit
      ]);
      
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAutocompleteSuggestions: ${error.message}`);
    }
  }

  /**
   * Get featured cities based on affordability and health metrics
   * @param {number} limit - Number of cities to return (default: from environment or 3)
   * @returns {Promise<Array>} Array of featured cities
   */
  async getFeaturedCities(limit = DEFAULT_CITIES_LIMIT) {
    try {
      // Check cache first
      const cached = featuredCitiesCache.getDefaultCached();
      if (cached) {
        logger.info('Returning cached default featured cities', { 
          resultCount: cached.length 
        });
        return cached;
      }

      const query = await queryLoader.loadQuery('featured-cities', 'search');
      const result = await db.query(query, [limit]);
      
      // Ensure unique cities
      const uniqueCities = result.rows.filter((city, index, self) => 
        index === self.findIndex(c => c.city === city.city && c.state === city.state)
      );
      
      if (uniqueCities.length !== result.rows.length) {
        logger.warn('Filtered out duplicate cities from database result', {
          original: result.rows.length,
          unique: uniqueCities.length
        });
      }
      
      // Cache the results
      featuredCitiesCache.setDefaultCached(uniqueCities);
      
      return uniqueCities;
    } catch (error) {
      throw new Error(`Database error in getFeaturedCities: ${error.message}`);
    }
  }

  /**
   * Get location-based featured cities near user's location
   * @param {string} userCity - User's city from IP geolocation
   * @param {string} userState - User's state from IP geolocation
   * @param {number} limit - Number of cities to return (default: from environment or 3)
   * @returns {Promise<Array>} Array of location-based featured cities
   */
  async getLocationBasedFeaturedCities(userCity, userState, limit = DEFAULT_CITIES_LIMIT) {
    try {
      // Step 1: Check location-based cache first
      const locationCached = featuredCitiesCache.getLocationBasedCached(userState);
      if (locationCached) {
        logger.info('Returning cached location-based featured cities', { 
          userState, 
          resultCount: locationCached.length 
        });
        return locationCached;
      }

      // Step 2: Check default featured cities cache
      const defaultCached = featuredCitiesCache.getDefaultCached();
      if (defaultCached) {
        logger.info('Location-based cache miss, returning cached default featured cities', { 
          userState, 
          resultCount: defaultCached.length 
        });
        return defaultCached;
      }

      // Step 3: Make API call for location-based
      logger.info('Both caches miss, making API call for location-based featured cities', { userState });
      
      let locationCities = [];
      let defaultCities = [];
      
      try {
        const startTime = Date.now();
        const locationQuery = await queryLoader.loadQuery('featured-cities-location-based', 'search');
        const locationResult = await db.query(locationQuery, [userState, limit]); // Only pass userState and limit
        const duration = Date.now() - startTime;
        
        if (locationResult.rows && locationResult.rows.length > 0) {
          logger.info('Location-based featured cities query successful', { 
            userCity, 
            userState, 
            resultCount: locationResult.rows.length,
            duration: `${duration}ms`,
            cities: locationResult.rows.map(city => `${city.city}, ${city.state}`)
          });
          
          // Ensure unique cities
          locationCities = locationResult.rows.filter((city, index, self) => 
            index === self.findIndex(c => c.city === city.city && c.state === city.state)
          );
          
          if (locationCities.length !== locationResult.rows.length) {
            logger.warn('Filtered out duplicate cities from location-based query', {
              original: locationResult.rows.length,
              unique: locationCities.length
            });
          }
        }
      } catch (error) {
        logger.warn('Location-based query failed', { 
          userCity, 
          userState, 
          error: error.message 
        });
      }

      // Step 4: Get default featured cities to supplement if needed
      logger.info('Getting default featured cities to supplement location-based results', { 
        locationCitiesCount: locationCities.length,
        requestedLimit: limit
      });
      
      try {
        const startTime = Date.now();
        const defaultQuery = await queryLoader.loadQuery('featured-cities', 'search');
        const defaultResult = await db.query(defaultQuery, [limit]);
        const duration = Date.now() - startTime;
        
        if (defaultResult.rows && defaultResult.rows.length > 0) {
          logger.info('Default featured cities query successful', { 
            resultCount: defaultResult.rows.length,
            duration: `${duration}ms`
          });
          
          // Ensure unique cities
          defaultCities = defaultResult.rows.filter((city, index, self) => 
            index === self.findIndex(c => c.city === city.city && c.state === city.state)
          );
          
          if (defaultCities.length !== defaultResult.rows.length) {
            logger.warn('Filtered out duplicate cities from default query', {
              original: defaultResult.rows.length,
              unique: defaultCities.length
            });
          }
        }
      } catch (error) {
        logger.warn('Default featured cities query failed', { error: error.message });
      }

      // Step 5: Combine and return the best cities
      let finalCities = [];
      
      // If we have location-based cities, use them first
      if (locationCities.length > 0) {
        finalCities = [...locationCities];
        
        // If we need more cities, add from default cities
        if (finalCities.length < limit && defaultCities.length > 0) {
          // Add default cities that aren't already in the list
          const existingCities = new Set(finalCities.map(city => `${city.city}-${city.state}`));
          const additionalCities = defaultCities.filter(city => 
            !existingCities.has(`${city.city}-${city.state}`)
          );
          
          finalCities = [...finalCities, ...additionalCities];
        }
      } else {
        // If no location-based cities, use default cities
        finalCities = defaultCities;
      }
      
      // Ensure we don't exceed the limit
      finalCities = finalCities.slice(0, limit);
      
      logger.info('Final featured cities result', {
        locationCitiesCount: locationCities.length,
        defaultCitiesCount: defaultCities.length,
        finalCitiesCount: finalCities.length,
        requestedLimit: limit
      });
      
      // Cache the results
      if (locationCities.length > 0) {
        featuredCitiesCache.setLocationBasedCached(userState, finalCities);
      } else {
        featuredCitiesCache.setDefaultCached(finalCities);
      }
      
      return finalCities;
      
    } catch (error) {
      throw new Error(`Database error in getLocationBasedFeaturedCities: ${error.message}`);
    }
  }

  /**
   * Get ZIP codes by city and state
   * @param {string} city - City name
   * @param {string} state - State name
   * @returns {Promise<Array>} Array of ZIP codes
   */
  async getZipcodesByCityState(city, state) {
    try {
      const query = await queryLoader.loadQuery('zipcodes-by-city-state', 'search');
      const result = await db.query(query, [`%${city}%`, `%${state}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getZipcodesByCityState: ${error.message}`);
    }
  }

  /**
   * Get cities by state
   * @param {string} state - State name
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of cities
   */
  async getCitiesByState(state, limit = 20) {
    try {
      const query = await queryLoader.loadQuery('cities-by-state', 'search');
      const result = await db.query(query, [`%${state}%`, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getCitiesByState: ${error.message}`);
    }
  }

  /**
   * Get all states
   * @returns {Promise<Array>} Array of states
   */
  async getAllStates() {
    try {
      const query = await queryLoader.loadQuery('all-states', 'search');
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error in getAllStates: ${error.message}`);
    }
  }

  /**
   * Search ZIP codes with comprehensive summary data and multiple filters
   * @param {Object} filters - Search filters
   * @param {string} filters.state - State filter (required)
   * @param {string} filters.city - City filter (optional)
   * @param {number} filters.minPrice - Minimum housing price
   * @param {number} filters.maxPrice - Maximum housing price
   * @param {number} filters.minIncome - Minimum mean income
   * @param {number} filters.maxIncome - Maximum mean income
   * @param {string} filters.healthMeasure - Health measure choice (1 of 6 options)
   * @param {number} filters.maxHealthRatio - Health measure threshold (max)
   * @param {number} filters.minPoliceDepts - Police departments threshold (min)
   * @param {number} filters.minPoliceOfficers - Police officer count threshold (min)
   * @param {number} filters.minHospitals - Hospitals threshold (min)
   * @param {number} filters.minFireStations - Firefighter stations threshold (min)
   * @param {number} filters.minFirefighters - Firefighter count threshold (min)
   * @param {number} filters.minChildcare - Childcare centers threshold (min)
   * @param {number} filters.minPopulation - Minimum population
   * @param {number} filters.maxPopulation - Maximum population
   * @param {number} filters.limit - Result limit
   * @returns {Promise<Array>} Array of ZIP code summaries
   */
  async searchZipcodeSummaries(filters) {
    const {
      state,
      city = null,
      minPrice = 0,
      maxPrice = 999999999,
      minIncome = 0,
      maxIncome = 999999999,
      healthMeasure,
      maxHealthRatio = 1,
      minPoliceDepts = 0,
      minPoliceOfficers = 0,
      minHospitals = 0,
      minFireStations = 0,
      minFirefighters = 0,
      minChildcare = 0,
      minPopulation = 0,
      maxPopulation = 999999999,
      limit = 50
    } = filters;

    try {
      const query = await queryLoader.loadQuery('zipcode-summaries', 'search');
      // Convert city to ILIKE pattern for case-insensitive matching
      const cityPattern = city ? city : null;
      
      const params = [
        state,
        cityPattern,
        healthMeasure,
        minPrice,
        maxPrice,
        minIncome,
        maxIncome,
        maxHealthRatio,
        minPoliceDepts,
        minPoliceOfficers,
        minHospitals,
        minFireStations,
        minFirefighters,
        minChildcare,
        minPopulation,
        maxPopulation,
        limit
      ];

      const result = await db.query(query, params);
      
      // If no results found, provide helpful suggestions
      if (result.rows.length === 0) {
        let suggestionMessage = '';
        
        if (city) {
          // Try to find similar cities in the same state
          const similarCitiesQuery = `
            SELECT DISTINCT city 
            FROM zipcode 
            WHERE state = $1 
              AND city ILIKE $2 
            LIMIT 5
          `;
          const similarCities = await db.query(similarCitiesQuery, [state, `%${city}%`]);
          
          if (similarCities.rows.length > 0) {
            const cityNames = similarCities.rows.map(row => row.city).join(', ');
            suggestionMessage = `No results found for "${city}" in ${state}. Did you mean: ${cityNames}?`;
          } else {
            // Check if the city exists in other states
            const otherStatesQuery = `
              SELECT DISTINCT state, city 
              FROM zipcode 
              WHERE city ILIKE $1 
              LIMIT 5
            `;
            const otherStates = await db.query(otherStatesQuery, [`%${city}%`]);
            
            if (otherStates.rows.length > 0) {
              const stateCityList = otherStates.rows.map(row => `${row.city}, ${row.state}`).join(', ');
              suggestionMessage = `No results found for "${city}" in ${state}. This city exists in other states: ${stateCityList}.`;
            } else {
              suggestionMessage = `No results found for "${city}" in ${state}. Please check the spelling or try a different city name.`;
            }
          }
        } else {
          suggestionMessage = `No results found for ${state}. Try adjusting your filters or search for a specific city.`;
        }
        
        // Return empty array with suggestion message
        return {
          rows: [],
          suggestion: suggestionMessage
        };
      }
      
      return result;
    } catch (error) {
      throw new Error(`Database error in searchZipcodeSummaries: ${error.message}`);
    }
  }
}

module.exports = new SearchRepository(); 