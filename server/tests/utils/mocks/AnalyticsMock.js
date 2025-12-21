/**
 * Analytics Mock Class
 * Handles analytics-related database queries
 */

const BaseMock = require('./BaseMock');
const { mockAnalyticsData } = require('../../fixtures/mockData');
const { logger } = require('../../../utils/logger');

class AnalyticsMock extends BaseMock {
  constructor() {
    super();
  }

  /**
   * Handle analytics queries
   * @param {string} query - SQL query
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleQuery(query, queryLower, params) {
    // Check for test mocks first
    const testMock = this.getTestMock(queryLower);
    if (testMock !== undefined) {
      let rows = testMock;
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      return this.createSuccessResponse(rows);
    }

    // Handle specific analytics query patterns
    if (queryLower.includes('population_analytics') && queryLower.includes('facilities_count') && queryLower.includes('ratio')) {
      // Facilities to population ratio query - return 1 row
      return this.createSuccessResponse(mockAnalyticsData.facilitiesToPopulation && mockAnalyticsData.facilitiesToPopulation.length > 0 ? mockAnalyticsData.facilitiesToPopulation : [
        {
          zipcode: '19104',
          facilities_count: 15,
          population: 25000,
          ratio: 0.0006
        }
      ]);
    }

    // Handle the exact query pattern from the test
    if (queryLower.includes('select zipcode, facilities_count, population, ratio from population_analytics')) {
      return this.createSuccessResponse([
        {
          zipcode: '19104',
          facilities_count: 15,
          population: 25000,
          ratio: 0.0006
        }
      ]);
    }

    // Handle zipcode summaries query (comprehensive summary data)
    if (queryLower.includes('zipcode') && queryLower.includes('summary')) {
      // Return mock data for zipcode summaries
      return this.createSuccessResponse([
        {
          zipcode: '19104',
          city: 'Philadelphia',
          state: 'PA',
          latitude: 39.9526,
          longitude: -75.1652,
          population: 25000,
          medianprice: 350000,
          meanincome: 45000,
          healthratio: 0.15,
          policedepartmentscount: 2,
          numpoliceofficerscount: 25,
          hospitalscount: 3,
          firestationscount: 1,
          firefighterscount: 15,
          childcarecenterscount: 5
        }
      ]);
    }

    // Handle featured cities query
    if (queryLower.includes('featured') && queryLower.includes('cities')) {
      // Return mock data for featured cities as an array
      return this.createSuccessResponse([
        {
          city: 'Philadelphia',
          state: 'PA',
          population: 1500000,
          avg_listing_price: 250000,
          avg_health_measure: 0.15,
          price_rank: 1,
          health_rank: 2,
          combined_rank: 3
        }
      ]);
    }

    if (queryLower.includes('select city, safety_score, avg_price, ratio from safety_analytics') ||
        queryLower.includes('safety_metrics') || 
        (queryLower.includes('safety') && queryLower.includes('ratio'))) {
      // Safety to sale ratio query
      return this.createSuccessResponse(mockAnalyticsData.safetyToSaleRatio);
    }

    if (queryLower.includes('select * from facilities')) {
      // General facilities query - return empty array for analytics context
      return this.createSuccessResponse([]);
    }

    if (queryLower.includes('zipcode as value') || queryLower.includes('autocomplete suggestions')) {
      // Return mock autocomplete suggestions
      return this.createSuccessResponse([
        { value: '19104', matchtype: 'zipcode' },
        { value: '19102', matchtype: 'zipcode' },
        { value: 'Philadelphia, PA', matchtype: 'city' },
        { value: 'PA', matchtype: 'state' }
      ]);
    }

    // Handle lowest median home price in city
    if (queryLower.includes('min_price_info') && queryLower.includes('rank = 1')) {
      const testMock = this.getTestMock('min_price_info');
      if (Array.isArray(testMock) && testMock.length > 0) {
        return this.createSuccessResponse(testMock);
      }
      // Fallback: if test mock is empty, return null
      return this.createSuccessResponse(null);
    }

    // Default fallback for analytics queries
    return this.createSuccessResponse([]);
  }

  /**
   * Check if query is for similar cities
   * @param {string} query - SQL query
   * @returns {boolean} True if similar cities query
   */
  isSimilarCitiesQuery(query) {
    // Match the actual migrated similar cities query pattern
    const hasSimilarCities = /similar-cities/i.test(query) || /similar cities/i.test(query);
    const hasTargetCity = /target_city/i.test(query);
    const hasSimilarCity = /similar_city/i.test(query);
    const hasSimilarityScore = /similarity_score/i.test(query);
    const hasCityComparison = /city.*comparison/i.test(query);
    
    logger.debug('[MOCK] Similar cities pattern detection:');
    logger.debug('[MOCK] hasSimilarCities:', hasSimilarCities);
    logger.debug('[MOCK] hasTargetCity:', hasTargetCity);
    logger.debug('[MOCK] hasSimilarCity:', hasSimilarCity);
    logger.debug('[MOCK] hasSimilarityScore:', hasSimilarityScore);
    logger.debug('[MOCK] hasCityComparison:', hasCityComparison);
    
    return hasSimilarCities || hasTargetCity || hasSimilarCity || (hasSimilarityScore && hasCityComparison);
  }

  /**
   * Handle similar cities query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleSimilarCitiesQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('similar_cities_query');
    if (testMock !== undefined) {
      return Promise.resolve(testMock);
    }
    
    let data = mockAnalyticsData.similarCities || null;
    if (!data) {
      data = [
        { city: 'Dallas', state: 'TX', similarity_score: 0.92 },
        { city: 'Austin', state: 'TX', similarity_score: 0.90 }
      ];
    }
    return Promise.resolve(data);
  }

  /**
   * Check if query is for similar ZIP codes
   * @param {string} query - SQL query
   * @returns {boolean} True if similar ZIP codes query
   */
  isSimilarZipcodesQuery(query) {
    // Match the actual migrated similar zipcodes query pattern
    const hasSimilarZipcodes = /similar-zipcodes/i.test(query) || /similar zipcodes/i.test(query);
    const hasCurrentZipcode = /current_zipcode/i.test(query);
    const hasAllZipcodes = /all_zipcodes/i.test(query);
    const hasSimilarityScore = /similarity_score/i.test(query);
    const hasZipcodeComparison = /zipcode.*comparison/i.test(query);
    
    logger.debug('[MOCK] Testing similar zipcodes regex against query:', query);
    logger.debug('[MOCK] hasSimilarZipcodes:', hasSimilarZipcodes);
    logger.debug('[MOCK] hasCurrentZipcode:', hasCurrentZipcode);
    logger.debug('[MOCK] hasAllZipcodes:', hasAllZipcodes);
    logger.debug('[MOCK] hasSimilarityScore:', hasSimilarityScore);
    logger.debug('[MOCK] hasZipcodeComparison:', hasZipcodeComparison);
    
    return hasSimilarZipcodes || hasCurrentZipcode || hasAllZipcodes || (hasSimilarityScore && hasZipcodeComparison);
  }

  /**
   * Handle similar ZIP codes query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleSimilarZipcodesQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('similar_zipcodes_query');
    if (testMock !== undefined) {
      return Promise.resolve(testMock);
    }
    
    let data = mockAnalyticsData.similarZipcodes || null;
    if (!data) {
      data = [
        { zipcode: '19103', similarity_score: 0.95 },
        { zipcode: '19102', similarity_score: 0.93 },
        { zipcode: '19101', similarity_score: 0.91 },
        { zipcode: '19105', similarity_score: 0.90 }
      ];
    }
    return Promise.resolve(data);
  }

  /**
   * Handle safety to sale ratio query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleSafetyToSaleRatioQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('safety_sale_ratio');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.safetyToSaleRatio || []);
  }

  /**
   * Handle underserved ZIP codes query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleUnderservedZipcodesQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('underserved_zipcodes');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.underservedZipcodes || []);
  }

  /**
   * Handle growth leaders query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleGrowthLeadersQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('growth');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.growthLeaders || []);
  }

  /**
   * Handle hospital distance query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleHospitalDistanceQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('hospital_distance');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.hospitalDistanceByPrice || []);
  }

  /**
   * Handle affordable ZIP codes query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleAffordableZipcodesQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('affordable');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.affordableZipcodes || []);
  }

  /**
   * Handle underserved healthcare query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleUnderservedHealthcareQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('underserved_healthcare');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.underservedHealthcare || []);
  }

  /**
   * Handle facilities population query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleFacilitiesPopulationQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('facilities_population');
    if (testMock !== undefined) {
      return this.createSuccessResponse(testMock);
    }
    
    return this.createSuccessResponse(mockAnalyticsData.facilitiesPopulation || []);
  }

  /**
   * Handle homepage featured query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleHomepageFeaturedQuery(params) {
    let data = mockAnalyticsData.homepageFeatured || [];
    if (!Array.isArray(data) || data.length === 0) {
      data = [{
        zipcode: '19104',
        hospital_count: 2,
        police_count: 1,
        firefighter_count: 1,
        total_facilities: 4,
        avg_poor_health_ratio: 15.2,
        health_measures_count: 5,
        population: 25000,
        meanincome: 45000,
        staffing_service_score: 0.75,
        health_service_score: 0.82,
        service_level_score: 0.78,
        rank: 1
      }];
    }
    return Promise.resolve(data);
  }

  /**
   * Handle location page query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleLocationPageQuery(params) {
    let data = mockAnalyticsData.locationPage || null;
    if (!data) {
      data = {
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        population: 25000,
        meanincome: 45000,
        medianlistingprice: 250000,
        activelistingcount: 15,
        policestations: 2,
        policeofficers: 25,
        hospitals: 3,
        childcarecenters: 5,
        firefighterdepartments: 1,
        firefighters: 10
      };
    }
    return Promise.resolve(data);
  }

  /**
   * Handle city growth rate query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleCityGrowthRateQuery(params) {
    // Check for test-specific mock first
    const testMock = this.getTestMock('city_growth_rate');
    if (testMock !== undefined) {
      // Handle both array and object formats
      let data = null;
      if (Array.isArray(testMock)) {
        data = testMock[0] || null;
      } else if (testMock && typeof testMock === 'object') {
        // Handle object with numeric keys
        const keys = Object.keys(testMock).filter(key => !isNaN(key));
        data = keys.length > 0 ? testMock[keys[0]] : null;
      }
      return Promise.resolve(data);
    }
    
    let data = mockAnalyticsData.cityGrowthRate || null;
    if (!data) {
      data = {
        city: params[0] || 'Houston',
        state: params[1] || 'TX',
        growthrate3year: 15.5
      };
    }
    return Promise.resolve(data);
  }

  /**
   * Setup test mock
   * @param {string} pattern - Pattern to match
   * @param {Array} data - Mock data
   */
  setupTestMock(pattern, data) {
    if (typeof logger !== 'undefined') {
      logger.debug(`[MOCK] setupTestMock: ${pattern} =>`, data);
    }
    this.testMocks.set(pattern, data);
  }


}

module.exports = AnalyticsMock; 