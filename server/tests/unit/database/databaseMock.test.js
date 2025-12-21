// Unit tests for database mocking functionality
const DatabaseMock = require('../../utils/databaseMock');
const { mockFacilitiesData, mockRealEstateData, mockAnalyticsData } = require('../../fixtures/mockData');

describe('Database Mock Unit Tests', () => {
  let databaseMock;

  beforeEach(() => {
    // Create a new DatabaseMock instance for each test
    databaseMock = new DatabaseMock();
  });

  afterEach(() => {
    // Clean up after each test
    databaseMock.resetMock();
    databaseMock.clearQueryHistory();
  });

  describe('Mock Pool Creation', () => {
    it('should create a mock pool with all required methods', () => {
      const mockPool = databaseMock.createMockPool();

      expect(mockPool).toBeDefined();
      expect(typeof mockPool.query).toBe('function');
      expect(typeof mockPool.connect).toBe('function');
      expect(typeof mockPool.end).toBe('function');
      expect(typeof mockPool.on).toBe('function');
      expect(typeof mockPool.release).toBe('function');
    });

    it('should setup default mock responses', async () => {
      const mockPool = databaseMock.createMockPool();

      // Test health check query
      const healthResult = await mockPool.query('SELECT current_timestamp');
      expect(healthResult.rows).toHaveLength(1);
      expect(healthResult.rows[0]).toHaveProperty('current_timestamp');

      // Test table listing query
      const tableResult = await mockPool.query('SELECT tablename FROM pg_tables');
      expect(tableResult.rows).toHaveLength(8); // 8 tables in mock data
      expect(tableResult.rows[0]).toHaveProperty('tablename');
    });
  });

  describe('Facilities Query Handling', () => {
    it('should handle top facilities queries', async () => {
      const mockPool = databaseMock.createMockPool();
      const zipcode = '19104';
      const limit = 5;

      const result = await mockPool.query(
        'SELECT * FROM facilities WHERE zipcode = $1 ORDER BY rating DESC LIMIT $2',
        [zipcode, limit]
      );

      expect(result.rows).toHaveLength(3); // 3 facilities in mock data for 19104
      expect(result.rowCount).toBe(3);
      expect(result.rows[0].zipcode).toBe(zipcode);
      expect(result.rows[0]).toHaveProperty('name');
      expect(result.rows[0]).toHaveProperty('rating');
    });

    it('should handle facility search queries', async () => {
      const mockPool = databaseMock.createMockPool();
      const city = 'Philadelphia';

      const result = await mockPool.query(
        'SELECT * FROM facilities WHERE city ILIKE $1',
        [city]
      );

      expect(result.rows).toHaveLength(3); // All 3 facilities are in Philadelphia
      expect(result.rowCount).toBe(3);
      expect(result.rows[0].city).toBe(city);
    });

    it('should handle facility search with multiple criteria', async () => {
      const mockPool = databaseMock.createMockPool();
      const zipcode = '19104';
      const city = 'Philadelphia';

      const result = await mockPool.query(
        'SELECT * FROM facilities WHERE zipcode = $1 AND city = $2',
        [zipcode, city]
      );

      expect(result.rows).toHaveLength(3); // All 3 facilities match both criteria
      expect(result.rowCount).toBe(3);
      expect(result.rows[0].zipcode).toBe(zipcode);
      expect(result.rows[0].city).toBe(city);
    });
  });

  describe('Real Estate Query Handling', () => {
    it('should handle lowest price queries', async () => {
      const mockPool = databaseMock.createMockPool();

      const result = await mockPool.query(
        'SELECT MIN(price) as min_price FROM realtor'
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rowCount).toBe(1);
      expect(result.rows[0]).toHaveProperty('min_price');
      expect(result.rows[0].min_price).toBe(250000); // Min price in mock data
    });

    it('should handle property search queries', async () => {
      const mockPool = databaseMock.createMockPool();
      const zipcode = '19104';

      const result = await mockPool.query(
        'SELECT * FROM realtor WHERE zipcode = $1',
        [zipcode]
      );

      expect(result.rows).toHaveLength(2); // 2 properties in mock data for 19104
      expect(result.rowCount).toBe(2);
      expect(result.rows[0].zipcode).toBe(zipcode);
      expect(result.rows[0]).toHaveProperty('price');
      expect(result.rows[0]).toHaveProperty('bedrooms');
    });
  });

  describe('Analytics Query Handling', () => {
    it('should handle safety to sale ratio queries', async () => {
      const mockPool = databaseMock.createMockPool();

      const result = await mockPool.query(
        'SELECT city, safety_score, avg_price, ratio FROM safety_analytics'
      );

      expect(result.rows).toHaveLength(2); // 2 cities in mock data
      expect(result.rowCount).toBe(2);
      expect(result.rows[0]).toHaveProperty('city');
      expect(result.rows[0]).toHaveProperty('safety_score');
      expect(result.rows[0]).toHaveProperty('avg_price');
      expect(result.rows[0]).toHaveProperty('ratio');
    });

    it('should handle facilities to population ratio queries', async () => {
      const mockPool = databaseMock.createMockPool();

      const result = await mockPool.query(
        'SELECT zipcode, facilities_count, population, ratio FROM population_analytics'
      );

      expect(result.rows).toHaveLength(1); // 1 zipcode in mock data
      expect(result.rowCount).toBe(1);
      expect(result.rows[0]).toHaveProperty('zipcode');
      expect(result.rows[0]).toHaveProperty('facilities_count');
      expect(result.rows[0]).toHaveProperty('population');
      expect(result.rows[0]).toHaveProperty('ratio');
    });
  });

  describe('Sample Data Query Handling', () => {
    it('should handle sample data queries with limit', async () => {
      const mockPool = databaseMock.createMockPool();
      const limit = 2;

      const result = await mockPool.query(
        'SELECT * FROM childcarecenters LIMIT $1',
        [limit]
      );

      expect(result.rows).toHaveLength(2); // 2 childcare centers returned (limit applied to available data)
      expect(result.rowCount).toBe(2);
      expect(result.rows[0]).toHaveProperty('id');
      expect(result.rows[0]).toHaveProperty('name');
      expect(result.rows[0]).toHaveProperty('zipcode');
    });

    it('should handle sample data queries without limit', async () => {
      const mockPool = databaseMock.createMockPool();

      const result = await mockPool.query(
        'SELECT * FROM facilities'
      );

      expect(result.rows).toHaveLength(0); // No facilities table in sample data, returns empty
      expect(result.rowCount).toBe(0);
    });
  });

  describe('Query History Tracking', () => {
    it('should track query history', async () => {
      const mockPool = databaseMock.createMockPool();

      await mockPool.query('SELECT * FROM facilities');
      await mockPool.query('SELECT * FROM realtor', ['19104']);

      const history = databaseMock.getQueryHistory();
      expect(history).toHaveLength(2);
      expect(history[0].query).toBe('SELECT * FROM facilities');
      expect(history[0].params).toEqual([]);
      expect(history[1].query).toBe('SELECT * FROM realtor');
      expect(history[1].params).toEqual(['19104']);
    });

    it('should clear query history', async () => {
      const mockPool = databaseMock.createMockPool();

      await mockPool.query('SELECT * FROM facilities');
      expect(databaseMock.getQueryHistory()).toHaveLength(1);

      databaseMock.clearQueryHistory();
      expect(databaseMock.getQueryHistory()).toHaveLength(0);
    });
  });

  describe('Query Verification', () => {
    it('should verify specific queries were called', async () => {
      const mockPool = databaseMock.createMockPool();

      await mockPool.query('SELECT * FROM facilities WHERE zipcode = $1', ['19104']);
      await mockPool.query('SELECT * FROM realtor');

      // Verify facilities query
      const facilitiesQueries = databaseMock.verifyQuery('facilities', 1);
      expect(facilitiesQueries).toHaveLength(1);
      expect(facilitiesQueries[0].params).toEqual(['19104']);

      // Verify realtor query
      const realtorQueries = databaseMock.verifyQuery('realtor', 1);
      expect(realtorQueries).toHaveLength(1);
    });

    it('should verify queries with specific parameters', async () => {
      const mockPool = databaseMock.createMockPool();

      await mockPool.query('SELECT * FROM facilities WHERE zipcode = $1', ['19104']);

      const queries = databaseMock.verifyQueryWithParams('facilities', ['19104'], 1);
      expect(queries).toHaveLength(1);
      expect(queries[0].query).toContain('facilities');
      expect(queries[0].params).toEqual(['19104']);
    });

    it('should fail verification when query count is wrong', () => {
      const mockPool = databaseMock.createMockPool();

      expect(() => {
        databaseMock.verifyQuery('facilities', 2); // Expect 2 but none called
      }).toThrow();
    });
  });

  describe('Custom Query Responses', () => {
    it('should setup custom query responses', async () => {
      const mockPool = databaseMock.createMockPool();
      const customResponse = {
        rows: [{ id: 999, name: 'Custom Facility' }],
        rowCount: 1
      };

      databaseMock.setupQueryResponse('custom', customResponse);

      const result = await mockPool.query('SELECT * FROM custom_table');
      expect(result.rows).toEqual(customResponse.rows);
      expect(result.rowCount).toBe(customResponse.rowCount);
    });

    it('should setup custom responses with regex patterns', async () => {
      const mockPool = databaseMock.createMockPool();
      const customResponse = {
        rows: [{ id: 888, name: 'Regex Facility' }],
        rowCount: 1
      };

      databaseMock.setupQueryResponse(/regex/i, customResponse);

      const result = await mockPool.query('SELECT * FROM regex_table');
      expect(result.rows).toEqual(customResponse.rows);
      expect(result.rowCount).toBe(customResponse.rowCount);
    });
  });

  describe('Error Handling', () => {
    it('should setup database errors', async () => {
      const mockPool = databaseMock.createMockPool();
      const error = new Error('Database connection failed');

      databaseMock.setupErrorResponse(error);

      await expect(mockPool.query('SELECT * FROM facilities')).rejects.toThrow('Database connection failed');
    });

    it('should handle unknown queries gracefully', async () => {
      const mockPool = databaseMock.createMockPool();

      const result = await mockPool.query('SELECT * FROM unknown_table');
      expect(result.rows).toEqual([]);
      expect(result.rowCount).toBe(0);
    });
  });

  describe('Mock Reset', () => {
    it('should reset mock to default behavior', async () => {
      const mockPool = databaseMock.createMockPool();

      // Setup custom response
      databaseMock.setupQueryResponse('custom', {
        rows: [{ id: 999 }],
        rowCount: 1
      });

      // Verify custom response works
      let result = await mockPool.query('SELECT * FROM custom_table');
      expect(result.rows[0].id).toBe(999);

      // Reset mock
      databaseMock.resetMock();

      // Verify default behavior is restored
      result = await mockPool.query('SELECT * FROM custom_table');
      expect(result.rows).toEqual([]);
    });

    it('should clear query history on reset', async () => {
      const mockPool = databaseMock.createMockPool();

      await mockPool.query('SELECT * FROM facilities');
      expect(databaseMock.getQueryHistory()).toHaveLength(1);

      databaseMock.resetMock();
      expect(databaseMock.getQueryHistory()).toHaveLength(0);
    });
  });

  describe('Module Mocking', () => {
    it('should mock the pg module', () => {
      // This test verifies that the module mocking functionality exists
      expect(typeof databaseMock.mockDatabaseModule).toBe('function');
      
      // Note: In a real test environment, this would mock the 'pg' module
      // For this unit test, we're just verifying the method exists
    });
  });
}); 