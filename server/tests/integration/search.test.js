const request = require('supertest');
const testUtils = require('../utils/testSetup');

describe('Search API Integration Tests', () => {
  let app;

  beforeEach(() => {
    testUtils.setupTestEnvironment();
    app = testUtils.createTestApp();
  });

  afterEach(() => {
    testUtils.teardownTestEnvironment();
  });

  describe('GET /api/v1/search/zipcode-summaries', () => {
    it('should return ZIP code summaries with filters', async () => {
      // Setup database response for ZIP code summary search using the actual SQL pattern
      testUtils.setupDatabaseResponse('ZipCodesInCityOrState AS', [
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
      // Also set up a more flexible pattern for substring matching
      testUtils.setupDatabaseResponse('zipcodesincityorstate', [
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

      const response = await request(app)
        .get('/api/v1/search/zipcode-summaries')
        .query({
          state: 'PA',
          city: 'Philadelphia',
          minPrice: 200000,
          maxPrice: 500000,
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('city');
      expect(response.body.data[0]).toHaveProperty('state');
    });

    it('should return ZIP code summaries without state parameter', async () => {
      // Setup database response for ZIP code summary search
      testUtils.setupDatabaseResponse('ZipCodesInCityOrState AS', [
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

      const response = await request(app)
        .get('/api/v1/search/zipcode-summaries')
        .query({
          city: 'Philadelphia',
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for invalid state format', async () => {
      const response = await request(app)
        .get('/api/v1/search/zipcode-summaries')
        .query({
          state: 'PENNSYLVANIA',
          limit: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('State must be a 2-letter abbreviation');
    });

    it('should return 400 for invalid price range', async () => {
      const response = await request(app)
        .get('/api/v1/search/zipcode-summaries')
        .query({
          state: 'PA',
          minPrice: 500000,
          maxPrice: 200000,
          limit: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid price range. Min price cannot be greater than max price.');
    });
  });

  describe('GET /api/v1/search/featured-cities', () => {
    it('should return featured cities', async () => {
      // Setup database response for featured cities
      testUtils.setupDatabaseResponse('featured cities', [
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

      const response = await request(app)
        .get('/api/v1/search/featured-cities')
        .query({ limit: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.cities).toBeDefined();
      expect(response.body.data.cities.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/search/autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      // Setup database response for autocomplete using the actual SQL pattern
      testUtils.setupDatabaseResponse('zipcode as value,', [
        { zipcode: '19104', city: 'Philadelphia', state: 'PA' },
        { zipcode: '19102', city: 'Philadelphia', state: 'PA' }
      ]);

      const response = await request(app)
        .get('/api/v1/search/autocomplete')
        .query({ term: '191', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.suggestions).toBeDefined();
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
    });
  });
}); 