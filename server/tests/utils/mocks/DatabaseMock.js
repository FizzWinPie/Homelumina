/**
 * Main Database Mock Class
 * Orchestrates all specialized mocks and provides unified interface
 */

const AnalyticsMock = require('./AnalyticsMock');
const RealEstateMock = require('./RealEstateMock');
const FacilitiesMock = require('./FacilitiesMock');
const HealthMock = require('./HealthMock');
const { logger } = require('../../../utils/logger');

class DatabaseMock {
  constructor(customMockData) {
    this.mockPool = null;
    this.isMocked = false;
    // Initialize specialized mocks, passing custom mock data to FacilitiesMock
    this.analyticsMock = new AnalyticsMock();
    this.realEstateMock = new RealEstateMock();
    if (customMockData) {
      this.facilitiesMock = require('./FacilitiesMock').createFacilitiesMock(customMockData);
    } else {
      this.facilitiesMock = new FacilitiesMock();
    }
    this.healthMock = new HealthMock();
  }

  /**
   * Create a mock database pool
   * @returns {Object} Mock database pool
   */
  createMockPool() {
    const mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      release: jest.fn()
    };

    // Setup default mock responses
    this.setupDefaultMocks(mockPool);
    
    this.mockPool = mockPool;
    return mockPool;
  }

  /**
   * Setup default mock responses for common queries
   * @param {Object} mockPool - Mock database pool
   */
  setupDefaultMocks(mockPool) {
    mockPool.query.mockImplementation((query, params = []) => {
      if (typeof logger !== 'undefined') {
        let queryInfo;
        if (typeof query === 'object') {
          try {
            queryInfo = JSON.stringify(query);
          } catch (e) {
            queryInfo = '[object with circular refs]';
          }
        } else {
          queryInfo = query;
        }
        logger.debug('[MOCK] mockPool.query called. Type of query:', typeof query, 'Value:', queryInfo);
      }
      // Record query history in all mocks
      this.recordQueryInAllMocks(query, params);

      // Check if we should throw an error
      if (this.shouldThrowError()) {
        return Promise.reject(this.getErrorToThrow());
      }

      // Check for custom responses first
      const customResponse = this.getCustomResponse(query);
      if (customResponse) {
        return Promise.resolve(customResponse);
      }

      // Route to appropriate specialized mock
      return this.routeQuery(query, params);
    });

    // Mock connection methods
    mockPool.connect.mockResolvedValue({
      query: mockPool.query,
      release: jest.fn()
    });

    mockPool.end.mockResolvedValue();
    mockPool.on.mockReturnValue(mockPool);
  }

  /**
   * Record query in all mocks
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   */
  recordQueryInAllMocks(query, params) {
    this.analyticsMock.recordQuery(query, params);
    this.realEstateMock.recordQuery(query, params);
    this.facilitiesMock.recordQuery(query, params);
    this.healthMock.recordQuery(query, params);
  }

  /**
   * Check if we should throw an error
   * @returns {boolean} True if should throw error
   */
  shouldThrowError() {
    const safeCall = (mock) => typeof mock.shouldThrowError === 'function' ? mock.shouldThrowError() : false;
    return safeCall(this.analyticsMock) ||
           safeCall(this.realEstateMock) ||
           safeCall(this.facilitiesMock) ||
           safeCall(this.healthMock);
  }

  /**
   * Get error to throw
   * @returns {Error} Error object to throw
   */
  getErrorToThrow() {
    return this.analyticsMock.getErrorToThrow() ||
           this.realEstateMock.getErrorToThrow() ||
           this.facilitiesMock.getErrorToThrow() ||
           this.healthMock.getErrorToThrow();
  }

  /**
   * Check for custom responses
   * @param {string} query - SQL query
   * @returns {Object|null} Custom response or null
   */
  getCustomResponse(query) {
    return this.analyticsMock.getCustomResponse(query) ||
           this.realEstateMock.getCustomResponse(query) ||
           this.facilitiesMock.getCustomResponse(query) ||
           this.healthMock.getCustomResponse(query);
  }

  /**
   * Route query to appropriate specialized mock
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  routeQuery(query, params) {
    if (typeof query !== 'string') {
      query = String(query);
    }
    const queryLower = query.toLowerCase();
    
    // Debug logging to see which mock is being selected
    logger.debug('[MOCK] Routing query:', query.substring(0, 100) + '...');
    logger.debug('[MOCK] Query lower:', queryLower.substring(0, 100) + '...');
    
    // Health queries (check first to handle sample data queries)
    if (this.isHealthQuery(queryLower)) {
      logger.debug('[MOCK] Routing to HealthMock');
      return this.healthMock.handleQuery(queryLower, params);
    }

    // Facilities queries (check before analytics to avoid conflicts)
    if (this.isFacilitiesQuery(queryLower)) {
      logger.debug('[MOCK] Routing to FacilitiesMock');
      return this.facilitiesMock.handleQuery(query, queryLower, params);
    }

    // Analytics queries (check after facilities to avoid conflicts)
    if (this.isAnalyticsQuery(queryLower)) {
      logger.debug('[MOCK] Routing to AnalyticsMock');
      return this.analyticsMock.handleQuery(query, queryLower, params);
    }

    // Real estate queries (check after analytics to avoid conflicts)
    if (this.isRealEstateQuery(queryLower)) {
      logger.debug('[MOCK] Routing to RealEstateMock');
      return this.realEstateMock.handleQuery(queryLower, params);
    }

    // Default fallback
    logger.debug('[MOCK] Default fallback to AnalyticsMock');
    return this.analyticsMock.handleQuery(query, queryLower, params);
  }

  /**
   * Check if query is analytics query
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if analytics query
   */
  isAnalyticsQuery(queryLower) {
    // Exclude price queries from analytics
    if (this.isRealEstateQuery(queryLower)) return false;
    return (queryLower.includes('safety') && queryLower.includes('ratio')) ||
           (queryLower.includes('safety_metrics') || queryLower.includes('safety_score')) ||
           (queryLower.includes('population_analytics') && queryLower.includes('ratio')) ||
           (queryLower.includes('population_analytics') && queryLower.includes('facilities_count')) ||
           (queryLower.includes('from population_analytics')) ||
           (queryLower.includes('growth') && queryLower.includes('rate')) ||
           (queryLower.includes('min_price_info') && queryLower.includes('rank = 1'));
  }

  /**
   * Check if query is real estate query
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if real estate query
   */
  isRealEstateQuery(queryLower) {
    // Route queries with localmarket, medianlistingprice, average_price, price_trends, etc. to RealEstateMock
    return queryLower.includes('localmarket') ||
           queryLower.includes('medianlistingprice') ||
           queryLower.includes('average_price') ||
           queryLower.includes('price_trends') ||
           queryLower.includes('property_count') ||
           queryLower.includes('realtor');
  }

  /**
   * Check if query is facilities query
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if facilities query
   */
  isFacilitiesQuery(queryLower) {
    // Exclude real estate and analytics queries
    if (this.isRealEstateQuery(queryLower) || this.isAnalyticsQuery(queryLower)) return false;
    return queryLower.includes('childcare') || 
           queryLower.includes('hospital') || 
           queryLower.includes('police') ||
           queryLower.includes('firefighter') ||
           queryLower.includes('facilities') ||
           queryLower.includes('validate-zipcode') ||
           queryLower.includes('childcarecenters') ||
           (queryLower.includes('facilities') && queryLower.includes('where')) ||
           (queryLower.includes('facilities') && queryLower.includes('zipcode')) ||
           (queryLower.includes('facilities') && queryLower.includes('city'));
  }

  /**
   * Check if query is health query
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if health query
   */
  isHealthQuery(queryLower) {
    return queryLower.includes('select now()') || queryLower.includes('select current_timestamp') ||
           queryLower.includes('information_schema.tables') || queryLower.includes('pg_tables') ||
           (queryLower.includes('community') && queryLower.includes('health')) ||
           (queryLower.includes('health') && queryLower.includes('statistics')) ||
           // More specific health patterns that don't conflict with facilities
           (queryLower.includes('select * from') && queryLower.includes('limit') && 
            (queryLower.includes('childcarecenters') || queryLower.includes('hospitals') || 
             queryLower.includes('policestations') || queryLower.includes('firestations')));
  }

  // Delegate methods to appropriate specialized mocks

  /**
   * Setup query response
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {Object|Array} response - Response data
   */
  setupQueryResponse(queryPattern, response) {
    this.analyticsMock.setupQueryResponse(queryPattern, response);
    this.realEstateMock.setupQueryResponse(queryPattern, response);
    this.facilitiesMock.setupQueryResponse(queryPattern, response);
    this.healthMock.setupQueryResponse(queryPattern, response);
  }

  /**
   * Setup error response
   * @param {Error} error - Error to throw
   */
  setupErrorResponse(error) {
    this.analyticsMock.setupErrorResponse(error);
    this.realEstateMock.setupErrorResponse(error);
    this.facilitiesMock.setupErrorResponse(error);
    this.healthMock.setupErrorResponse(error);
  }

  /**
   * Get test mock for specific pattern
   * @param {string} pattern - Pattern to match
   * @returns {Array|undefined} Test mock data
   */
  getTestMock(pattern) {
    return this.analyticsMock.getTestMock(pattern) ||
           this.realEstateMock.getTestMock(pattern) ||
           this.facilitiesMock.getTestMock(pattern) ||
           this.healthMock.getTestMock(pattern);
  }

  /**
   * Setup test mock
   * @param {string} pattern - Pattern to match
   * @param {Array} data - Mock data
   */
  setupTestMock(pattern, data) {
    this.analyticsMock.setupTestMock(pattern, data);
    this.realEstateMock.setupTestMock(pattern, data);
    this.facilitiesMock.setupTestMock(pattern, data);
    this.healthMock.setupTestMock(pattern, data);
  }

  /**
   * Reset mock to default behavior
   */
  resetMock() {
    if (this.mockPool) {
      this.mockPool.query.mockReset();
      this.setupDefaultMocks(this.mockPool);
    }
    // Only reset state, do not re-instantiate
    this.analyticsMock.reset();
    this.realEstateMock.reset();
    this.facilitiesMock.reset();
    this.healthMock.reset();
  }

  /**
   * Mock database config (legacy method for test setup)
   * @returns {Object} Mocked database config
   */
  mockDatabaseConfig() {
    return {
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_password'
    };
  }

  /**
   * Get query history
   * @returns {Array} Query history
   */
  getQueryHistory() {
    return this.analyticsMock.getQueryHistory();
  }

  /**
   * Clear query history
   */
  clearQueryHistory() {
    this.analyticsMock.clearQueryHistory();
    this.realEstateMock.clearQueryHistory();
    this.facilitiesMock.clearQueryHistory();
    this.healthMock.clearQueryHistory();
  }

  /**
   * Verify specific query was called
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {number} times - Expected number of calls
   * @returns {Array} Matching queries
   */
  verifyQuery(queryPattern, times = 1) {
    return this.analyticsMock.verifyQuery(queryPattern, times);
  }

  /**
   * Verify query with parameters
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {Array} expectedParams - Expected parameters
   * @param {number} times - Expected number of calls
   * @returns {Array} Matching queries
   */
  verifyQueryWithParams(queryPattern, expectedParams, times = 1) {
    return this.analyticsMock.verifyQueryWithParams(queryPattern, expectedParams, times);
  }

  /**
   * Mock database module
   * @returns {Object} Mocked database module
   */
  mockDatabaseModule() {
    return {
      pool: this.createMockPool(),
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn()
    };
  }

  /**
   * Setup database response (alias for setupQueryResponse)
   * @param {string|RegExp} queryPattern - Query pattern to match
   * @param {Object|Array} response - Response data
   */
  setupDatabaseResponse(queryPattern, response) {
    this.setupQueryResponse(queryPattern, response);
  }

  /**
   * Setup database error (alias for setupErrorResponse)
   * @param {Error} error - Error to throw
   */
  setupDatabaseError(error) {
    this.setupErrorResponse(error);
  }
}

function createDatabaseMock(customMockData) {
  return new DatabaseMock(customMockData);
}

module.exports = DatabaseMock;
module.exports.createDatabaseMock = createDatabaseMock; 