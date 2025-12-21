// Test environment setup and configuration

// 1. Set env vars early
process.env.ENABLE_DB_MOCKS = 'true';
process.env.USE_REAL_DB = 'false';

// Create a single shared mock instance and pool for all tests
const { DatabaseMock } = require('./mocks');
const dbMock = new DatabaseMock();
const mockPool = dbMock.createMockPool();

// 2. Mock the database module before any app code loads
jest.doMock('../../config/database', () => mockPool);

const path = require('path');
const { createDatabaseMock } = require('./mocks/DatabaseMock');
let integrationMockData = null;
if (process.env.TEST_TYPE === 'integration') {
  integrationMockData = require('../fixtures/mockData.integration');
}

const { logger } = require('../../utils/logger');

// Load test environment variables
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });
} catch (error) {
  // .env.test file doesn't exist, use defaults
}

// Configure logger for testing - suppress error logs for expected validation errors
if (process.env.NODE_ENV === 'test') {
  // Set log level to warn to suppress info and debug logs during tests
  process.env.LOG_LEVEL = 'warn';
}

// Test configuration
const testConfig = {
  // Database configuration for tests
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cis5500_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },

  // API configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    version: 'v1'
  },

  // Test data configuration
  testData: {
    zipcode: '19104',
    city: 'Philadelphia',
    limit: 5,
    maxPrice: 300000
  },

  // Mock configuration
  mocks: {
    enableDatabaseMocks: process.env.ENABLE_DB_MOCKS !== 'false', // Default to true
    enableExternalServiceMocks: process.env.ENABLE_EXTERNAL_MOCKS !== 'false', // Default to true
    useRealDatabase: process.env.USE_REAL_DB === 'true' // Default to false
  }
};

// Test utilities
const testUtils = {
  // Database mock instance
  dbMock: dbMock,

  // Initialize database mocking
  setupDatabaseMocks() {
    if (testConfig.mocks.enableDatabaseMocks && !testConfig.mocks.useRealDatabase) {
      this.clearModuleCache();
      jest.doMock('../../config/database', () => mockPool);
      dbMock.mockDatabaseConfig();
      return mockPool;
    }
    return null;
  },

  // Reset database mocks
  resetDatabaseMocks() {
    if (dbMock) {
      dbMock.resetMock();
    }
  },

  // Clear module cache to ensure fresh imports
  clearModuleCache() {
    // Clear cache for key modules that might be cached
    const modulesToClear = [
      '../../config/database',
      '../../controllers/facilitiesController',
      '../../controllers/realEstateController',
      '../../controllers/analyticsController',
      '../../app'
    ];
    
    modulesToClear.forEach(modulePath => {
      const resolvedPath = require.resolve(modulePath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
    });
  },

  // Create test app instance with mocked database
  createTestApp() {
    // Setup database mocks first
    this.setupDatabaseMocks();
    
    // Clear module cache to ensure fresh imports
    this.clearModuleCache();
    
    // Mock the database module before importing the app
    if (testConfig.mocks.enableDatabaseMocks && !testConfig.mocks.useRealDatabase) {
      jest.doMock('../../config/database', () => {
        const mockPool = this.dbMock.createMockPool();
        return mockPool;
      });
    }
    
    // Import the app (will use mocked database)
    const app = require('../../app');
    
    return app;
  },

  // Generate test data
  generateTestData: (type, count = 1) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'facility':
          data.push({
            id: i + 1,
            name: `Test Facility ${i + 1}`,
            type: 'childcare',
            zipcode: testConfig.testData.zipcode,
            city: testConfig.testData.city,
            rating: 4.0 + (Math.random() * 1.0),
            address: `${100 + i} Test St, ${testConfig.testData.city}, PA ${testConfig.testData.zipcode}`,
            phone: `215-555-${String(1000 + i).padStart(4, '0')}`,
            website: `https://test${i + 1}.com`
          });
          break;
        case 'property':
          data.push({
            id: i + 1,
            address: `${200 + i} Test Ave, ${testConfig.testData.city}, PA ${testConfig.testData.zipcode}`,
            price: 200000 + (Math.random() * 200000),
            bedrooms: 2 + Math.floor(Math.random() * 3),
            bathrooms: 1 + Math.floor(Math.random() * 2),
            square_feet: 1000 + (Math.random() * 1000),
            zipcode: testConfig.testData.zipcode,
            city: testConfig.testData.city,
            listing_date: new Date().toISOString().split('T')[0]
          });
          break;
        default:
          throw new Error(`Unknown test data type: ${type}`);
      }
    }
    return count === 1 ? data[0] : data;
  },

  // Clean up test data (only for real database)
  cleanupTestData: async (pool, table, condition = {}) => {
    if (testConfig.mocks.useRealDatabase && pool) {
      try {
        let query = `DELETE FROM ${table}`;
        const values = [];
        
        if (Object.keys(condition).length > 0) {
          const conditions = Object.keys(condition).map((key, index) => {
            values.push(condition[key]);
            return `${key} = $${index + 1}`;
          });
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        await pool.query(query, values);
      } catch (error) {
        // Cleanup failed silently in tests
      }
    }
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Validate API response structure
  validateApiResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(typeof response.body.success).toBe('boolean');
    
    if (response.body.success) {
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    } else {
      expect(response.body).toHaveProperty('error');
    }
  },


  // Setup test environment
  setupTestEnvironment: () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001'; // Use different port for tests
    
    // Setup database mocks if enabled
    if (testConfig.mocks.enableDatabaseMocks && !testConfig.mocks.useRealDatabase) {
      testUtils.setupDatabaseMocks();
    }
    
    // Mock console methods to reduce noise in tests
    if (process.env.SUPPRESS_CONSOLE === 'true') {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    }
  },

  // Teardown test environment
  teardownTestEnvironment: () => {
    // Reset database mocks
    testUtils.resetDatabaseMocks();
    
    // Restore console methods
    if (process.env.SUPPRESS_CONSOLE === 'true') {
      jest.restoreAllMocks();
    }
  },

  // Helper to setup specific database responses for tests
  setupDatabaseResponse: (queryPattern, response, target) => {
    // Validate query pattern is a string
    if (typeof queryPattern !== 'string') {
      throw new Error('[TEST] Non-string key detected in setupDatabaseResponse: ' + JSON.stringify(queryPattern));
    }
    // Log using an object property to avoid mutation by Winston
    logger.debug(`[TEST] setupDatabaseResponse: pattern=${queryPattern}, target=${target}, value=`, { response });
    // Store a shallow copy if array, but do NOT wrap in object
    let safeResponse = response;
    if (target === 'realEstate') {
      // Always store as array for real estate mocks
      if (!Array.isArray(response)) {
        safeResponse = response == null ? [] : [response];
      } else {
        safeResponse = [...response];
      }
    } else {
      safeResponse = Array.isArray(response) ? [...response] : response;
    }
    if (dbMock && mockPool) {
      if (target === 'facilities') {
        dbMock.facilitiesMock.setupTestMock(queryPattern, safeResponse);
      } else if (target === 'analytics') {
        dbMock.analyticsMock.setupTestMock(queryPattern, safeResponse);
      } else if (target === 'realEstate') {
        dbMock.realEstateMock.setupTestMock(queryPattern, safeResponse);
      } else if (target === 'health') {
        dbMock.healthMock.setupTestMock(queryPattern, safeResponse);
      }
    }
  },

  // Helper to setup database error for tests
  setupDatabaseError: (error) => {
    if (dbMock && mockPool) {
      dbMock.setupErrorResponse(error);
    }
  },

  // Helper to verify database queries
  verifyDatabaseQuery: (queryPattern, times = 1) => {
    if (dbMock) {
      return dbMock.verifyQuery(queryPattern, times);
    }
    return [];
  },

  // Helper to verify database queries with parameters
  verifyDatabaseQueryWithParams: (queryPattern, expectedParams, times = 1) => {
    if (dbMock) {
      return dbMock.verifyQueryWithParams(queryPattern, expectedParams, times);
    }
    return [];
  },

  // Get database query history
  getDatabaseQueryHistory: () => {
    if (dbMock) {
      return dbMock.getQueryHistory();
    }
    return [];
  },

  // Clear database query history
  clearDatabaseQueryHistory: () => {
    if (dbMock) {
      dbMock.clearQueryHistory();
    }
  }
};

// Global test setup
beforeAll(() => {
  testUtils.setupTestEnvironment();
});

// Global test teardown
afterAll(() => {
  testUtils.teardownTestEnvironment();
});

// Reset modules between tests to ensure clean state
afterEach(() => {
  jest.resetModules();
});

// Reset database mocks before each test
beforeEach(() => {
  testUtils.resetDatabaseMocks();
});

// Export test utilities and configuration
module.exports = {
  ...testUtils,
  testConfig
}; 