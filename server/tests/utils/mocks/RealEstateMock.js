/**
 * Real Estate Mock Class
 * Handles real estate-related database queries
 */

const BaseMock = require('./BaseMock');
const { mockRealEstateData } = require('../../fixtures/mockData');
const { logger } = require('../../../utils/logger');

class RealEstateMock extends BaseMock {
  constructor() {
    super();
  }

  /**
   * Handle real estate queries
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleQuery(queryLower, params) {
    logger.debug(`[RealEstateMock] handleQuery called`, { queryLower, params });
    // Lowest price zipcode query - matches the new complex query pattern
    if (this.isLowestPriceZipcodeQuery(queryLower)) {
      return this.handleLowestPriceZipcodeQuery(params);
    }

    // ZIP code summaries query - complex query with multiple CTEs
    if (queryLower.includes('zipcodesincityorstate as') || queryLower.includes('zipcodesincityorstate as')) {
      return this.handleZipcodeSummariesQuery(params);
    }

    // Featured cities query - complex query with ranking
    if (queryLower.includes('citypricerank as') || queryLower.includes('cityhealthrank as')) {
      return this.handleFeaturedCitiesQuery(params);
    }

    // Real estate price queries (check before property search to avoid conflicts)
    if (queryLower.includes('min(') || queryLower.includes('min_price')) {
      return this.handleRealEstatePriceQuery(queryLower, params);
    }

    // Property search queries (with realtor table)
    if (queryLower.includes('from realtor') || (queryLower.includes('realtor') && queryLower.includes('where'))) {
      return this.handlePropertySearchQuery(params);
    }

    // Real estate price queries
    if (queryLower.includes('realtor') || queryLower.includes('localmarket')) {
      return this.handleRealEstatePriceQuery(queryLower, params);
    }

    // Price trend queries
    if (queryLower.includes('medianlistingprice') && queryLower.includes('monthdate')) {
      logger.debug(`[RealEstateMock] Routing to handlePriceTrendQuery`, { queryLower, params });
      return this.handlePriceTrendQuery(params);
    }

    // Average price queries
    if (queryLower.includes('avg(') && queryLower.includes('medianlistingprice')) {
      return this.handleAveragePriceQuery(params);
    }

    // Statistics queries
    if (queryLower.includes('statistics') && queryLower.includes('zipcode')) {
      return this.handleStatisticsQuery(params);
    }

    // Default real estate response
    return this.createSuccessResponse(mockRealEstateData.default || []);
  }

  /**
   * Check if query is for lowest price zipcode
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if lowest price zipcode query
   */
  isLowestPriceZipcodeQuery(queryLower) {
    return (queryLower.includes('city_zipcodes') && 
            queryLower.includes('home_prices') && 
            queryLower.includes('min_price_info')) ||
           queryLower.includes('lowest median home price zip code');
  }

  /**
   * Handle lowest price zipcode query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleLowestPriceZipcodeQuery(params) {
    // Check if a test mock is set up for this query
    let testMock = this.getTestMock('city_zipcodes');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("city_zipcodes") =>', testMock);
    if (testMock === undefined) {
      testMock = this.getTestMock('from city_zipcodes');
      if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("from city_zipcodes") =>', testMock);
    }
    if (testMock === undefined) {
      testMock = this.getTestMock('home_prices');
      if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("home_prices") =>', testMock);
    }
    if (testMock === undefined) {
      testMock = this.getTestMock('min_price_info');
      if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("min_price_info") =>', testMock);
    }
    if (testMock !== undefined) {
      // For this specific query, if the test mock is empty, return { rows: [] }
      // This mimics the pg response for no results
      if (Array.isArray(testMock) && testMock.length === 0) {
        return { rows: [] };
      }
      return this.createSuccessResponse(testMock);
    }
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] No testMock found, returning default data for lowest price zipcode');
    // Return default mock data
    return this.createSuccessResponse([
      {
        zipcode: '77002',
        median_home_price: 180000,
        city: 'Houston',
        state: 'TX',
        rank: 1
      }
    ]);
  }

  /**
   * Handle ZIP code summaries query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleZipcodeSummariesQuery(params) {
    // Check for test mocks first
    const testMockZipcodes = this.getTestMock('ZipCodesInCityOrState AS');
    const testMockZipcodesLower = this.getTestMock('zipcodesincityorstate');
    let result = testMockZipcodes || testMockZipcodesLower;
    
    if (Array.isArray(result) && result.length > 0) {
      return this.createSuccessResponse(result);
    }
    
    // Return default mock data for ZIP code summaries
    return this.createSuccessResponse([
      {
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        population: 25000,
        medianprice: 350000,
        meanincome: 45000,
        healthratio: 0.15,
        policedepartmentscount: 2,
        numpoliceofficerscount: 25,
        hospitalscount: 3,
        firestationscount: 1,
        firefighterscount: 15,
        childcarecenterscount: 5,
        latitude: 39.9526,
        longitude: -75.1652
      }
    ]);
  }

  /**
   * Handle featured cities query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleFeaturedCitiesQuery(params) {
    // Check for test mocks first
    const testMockFeatured = this.getTestMock('featured cities');
    if (Array.isArray(testMockFeatured) && testMockFeatured.length > 0) {
      return this.createSuccessResponse(testMockFeatured);
    }
    
    // Return default mock data for featured cities
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

  /**
   * Handle real estate price query
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleRealEstatePriceQuery(queryLower, params) {
    const testMockLocal = this.getTestMock('localmarket');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("localmarket") =>', testMockLocal);
    const testMockFromLocal = this.getTestMock('from localmarket');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("from localmarket") =>', testMockFromLocal);
    let result = testMockLocal || testMockFromLocal;
    if (Array.isArray(result)) {
      // If the test mock is an empty array, return it as is
      return this.createSuccessResponse(result);
    }
    // Handle SELECT MIN(price) as min_price FROM realtor
    if (queryLower.includes('min(price) as min_price')) {
      return this.createSuccessResponse([
        { min_price: 250000 }
      ]);
    }
    // Fallback: always return 2 rows for price queries
    if (queryLower.includes('average property prices') || queryLower.includes('order by average_price desc')) {
      return this.createSuccessResponse([
        { zipcode: '19104', average_price: 350000, property_count: 25 },
        { zipcode: '19102', average_price: 320000, property_count: 30 }
      ]);
    }
    if (queryLower.includes('order by medianlistingprice asc')) {
      return this.createSuccessResponse([
        { zipcode: '19104', medianlistingprice: 250000 },
        { zipcode: '19102', medianlistingprice: 200000 }
      ]);
    }
    if (queryLower.includes('order by medianlistingprice desc')) {
      return this.createSuccessResponse([
        { zipcode: '19104', medianlistingprice: 500000 },
        { zipcode: '19102', medianlistingprice: 450000 }
      ]);
    }
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] No testMock found, returning empty array for price query');
    return this.createSuccessResponse([]);
  }

  /**
   * Handle price trend query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handlePriceTrendQuery(params) {
    const testMockMedian = this.getTestMock('medianlistingprice');
    const testMockLocal = this.getTestMock('localmarket');
    const testMockFromLocal = this.getTestMock('from localmarket');
    if (Array.isArray(testMockMedian) && testMockMedian.length > 0) {
      logger.debug(`[RealEstateMock] Returning testMock for price trends (medianlistingprice)`, { testMockMedian });
      return this.createSuccessResponse(testMockMedian);
    }
    if (Array.isArray(testMockLocal) && testMockLocal.length > 0) {
      logger.debug(`[RealEstateMock] Returning testMock for price trends (localmarket)`, { testMockLocal });
      return this.createSuccessResponse(testMockLocal);
    }
    if (Array.isArray(testMockFromLocal) && testMockFromLocal.length > 0) {
      logger.debug(`[RealEstateMock] Returning testMock for price trends (from localmarket)`, { testMockFromLocal });
      return this.createSuccessResponse(testMockFromLocal);
    }
    // Fallback: always return 2 rows for price trends
    logger.debug(`[RealEstateMock] Returning fallback price trends data`);
    return this.createSuccessResponse([
      { monthdate: '2024-01-01', medianlistingprice: 250000 },
      { monthdate: '2024-02-01', medianlistingprice: 255000 }
    ]);
  }

  /**
   * Handle average price query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleAveragePriceQuery(params) {
    return this.createSuccessResponse(mockRealEstateData.averagePrices || [
      {
        zipcode: '19104',
        average_price: 252500,
        count: 2
      },
      {
        zipcode: '19105',
        average_price: 300000,
        count: 1
      }
    ]);
  }

  /**
   * Handle property search query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handlePropertySearchQuery(params) {
    const testMockRealtor = this.getTestMock('realtor');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("realtor") =>', testMockRealtor);
    const testMockFromRealtor = this.getTestMock('from realtor');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("from realtor") =>', testMockFromRealtor);
    if (testMockRealtor !== undefined) {
      return this.createSuccessResponse(testMockRealtor);
    }
    if (testMockFromRealtor !== undefined) {
      return this.createSuccessResponse(testMockFromRealtor);
    }
    
    // Fallback to localmarket mocks for backward compatibility
    const testMockLocal = this.getTestMock('localmarket');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("localmarket") =>', testMockLocal);
    const testMockFromLocal = this.getTestMock('from localmarket');
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] getTestMock("from localmarket") =>', testMockFromLocal);
    if (testMockLocal !== undefined) {
      return this.createSuccessResponse(testMockLocal);
    }
    if (testMockFromLocal !== undefined) {
      return this.createSuccessResponse(testMockFromLocal);
    }
    
    // Always return mock data with price and bedrooms properties
    if (Array.isArray(mockRealEstateData.properties) && mockRealEstateData.properties.length > 0) {
      // Map any existing properties to ensure correct keys
      return this.createSuccessResponse(
        mockRealEstateData.properties.map(p => ({
          zipcode: p.zipcode,
          price: p.price || p.medianlistingprice || 0,
          bedrooms: p.bedrooms || p.bedroom || 0,
          bathrooms: p.bathrooms || p.bathroom || 0
        }))
      );
    }
    if (typeof logger !== 'undefined') logger.debug('[RealEstateMock] No testMock found, returning fallback property search data');
    return this.createSuccessResponse([
      {
        zipcode: '19104',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2
      },
      {
        zipcode: '19104',
        price: 350000,
        bedrooms: 4,
        bathrooms: 3
      }
    ]);
  }

  /**
   * Handle statistics query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleStatisticsQuery(params) {
    return this.createSuccessResponse(mockRealEstateData.statistics || [
      {
        zipcode: '19104',
        avg_price: 252500,
        min_price: 250000,
        max_price: 255000,
        count: 2
      }
    ]);
  }
}

module.exports = RealEstateMock; 