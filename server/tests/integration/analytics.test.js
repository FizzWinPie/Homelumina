const request = require('supertest');
const testUtils = require('../utils/testSetup');

// Import app after mock setup
let app;

// Mock the analytics repository
jest.mock('../../repositories/analyticsRepository');

describe('Analytics API Integration Tests', () => {
  beforeEach(() => {
    testUtils.setupTestEnvironment();
    // Import app after mock setup
    app = require('../../app');
  });

  afterEach(() => {
    testUtils.teardownTestEnvironment();
    jest.clearAllMocks();
  });

  describe('GET /api/v1/analytics/safety-sale-ratio', () => {
    it('should return safety to sale ratio for valid city', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSafetyToSaleRatio.mockResolvedValue([
        {
          city: 'Philadelphia',
          state: 'PA',
          safety_score: 85,
          avg_price: 250000,
          ratio: 0.34
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/safety-sale-ratio')
        .query({ city: 'Philadelphia' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('city');
      expect(response.body.data[0]).toHaveProperty('safety_score');
    });

    it('should return 400 for invalid city parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/safety-sale-ratio')
        .query({ city: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/safety-sale-ratio')
        .query({ limit: 101 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/analytics/underserved-zipcodes', () => {
    it('should return underserved ZIP codes', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getUnderservedZipcodes.mockResolvedValue([
        {
          zipcode: '19104',
          facility_count: 5,
          population: 25000,
          underserved_level: 'Critical'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/underserved-zipcodes')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('underserved_level');
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/underserved-zipcodes')
        .query({ limit: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/analytics/growth-leaders', () => {
    it('should return growth leaders data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getGrowthLeaders.mockResolvedValue([
        {
          city: 'Austin',
          state: 'TX',
          growth_rate: '8.5%',
          population_change: 15000
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/growth-leaders')
        .query({ limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('city');
      expect(response.body.data[0]).toHaveProperty('growth_rate');
    });
  });

  describe('GET /api/v1/analytics/hospital-distance-by-price', () => {
    it('should return hospital distance by price data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getHospitalDistanceByPrice.mockResolvedValue([
        {
          zipcode: '19104',
          avg_price: 250000,
          hospital_distance: 2.5,
          price_category: 'Mid-Range'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/hospital-distance-by-price')
        .query({ limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('hospital_distance');
    });
  });

  describe('GET /api/v1/analytics/affordable-zipcodes', () => {
    it('should return affordable ZIP codes', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getAffordableZipcodes.mockResolvedValue([
        {
          zipcode: '19104',
          avg_price: 250000,
          affordability_level: 'Very Affordable',
          price_to_income_ratio: 3.2
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/affordable-zipcodes')
        .query({ maxPrice: 300000, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('affordability_level');
    });

    it('should return 400 for invalid maxPrice', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/affordable-zipcodes')
        .query({ maxPrice: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/analytics/underserved-healthcare', () => {
    it('should return underserved healthcare data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getUnderservedHealthcare.mockResolvedValue([
        {
          zipcode: '19104',
          population: 25000,
          hospital_count: 2,
          underserved_level: 'Moderate',
          healthcare_access_score: 65
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/underserved-healthcare')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('underserved_level');
    });
  });

  describe('GET /api/v1/analytics/facilities-population', () => {
    it('should return facilities to population ratio', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getFacilitiesToPopulation.mockResolvedValue([
        {
          zipcode: '19104',
          population: 25000,
          facility_count: 15,
          ratio: 0.6
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/facilities-population')
        .query({ zipcode: '19104' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toBeDefined();
      expect(Array.isArray(response.body.statistics)).toBe(true);
      expect(response.body.statistics.length).toBeGreaterThan(0);
      expect(response.body.statistics[0]).toHaveProperty('facilitiesPer10k');
      expect(response.body.statistics[0]).toHaveProperty('facilityBreakdown');
      expect(response.body.statistics[0]).toHaveProperty('population');
      expect(response.body.statistics[0]).toHaveProperty('ratio');
      expect(response.body.statistics[0]).toHaveProperty('totalFacilities');
    });

    it('should return 400 for invalid ZIP code', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/facilities-population')
        .query({ zipcode: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/analytics/homepage-featured-zipcodes', () => {
    it('should return homepage featured ZIP codes', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getHomepageFeaturedZipcodes.mockResolvedValue([
        {
          zipcode: '19104',
          city: 'Philadelphia',
          state: 'PA',
          avg_price: 250000,
          population: 25000,
          feature_score: 85
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/homepage-featured-zipcodes')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('zipcode');
      expect(response.body.data[0]).toHaveProperty('facilities');
      expect(response.body.data[0]).toHaveProperty('healthMetrics');
      expect(response.body.data[0]).toHaveProperty('income');
      expect(response.body.data[0]).toHaveProperty('scores');
      expect(response.body.data[0]).toHaveProperty('analysis');
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/homepage-featured-zipcodes')
        .query({ limit: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Test location page data endpoint
   */
  describe('GET /api/v1/analytics/location/:zipcode', () => {
    it('should return location page data for a valid ZIP code', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/location/19104')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.zipcode).toBe('19104');
      expect(response.body.data.location).toBeDefined();
      expect(response.body.data.demographics).toBeDefined();
      expect(response.body.data.realEstate).toBeDefined();
      expect(response.body.data.income).toBeDefined();
      expect(response.body.data.facilities).toBeDefined();
      expect(response.body.type).toBe('location_page_data');
    });

    it('should return 400 for invalid ZIP code format', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/location/123')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ZIP code format');
    });
  });

  describe('GET /api/v1/analytics/city-growth-rate/:city/:state', () => {
    it('should return city growth rate data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getCityGrowthRate.mockResolvedValue({
        city: 'Houston',
        state: 'TX',
        growthrate3year: '5.25%'
      });

      const response = await request(app)
        .get('/api/v1/analytics/city-growth-rate/Houston/TX')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('city');
      expect(response.body.data).toHaveProperty('state');
      expect(response.body.data).toHaveProperty('growthRate3Year');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.analysis).toHaveProperty('period');
      expect(response.body.data.analysis).toHaveProperty('description');
    });

    it('should handle cities with no data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getCityGrowthRate.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/analytics/city-growth-rate/NonexistentCity/XX')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });
  });

  describe('GET /api/v1/analytics/similar-zipcodes/:zipcode', () => {
    it('should return similar ZIP codes data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSimilarZipcodes.mockResolvedValue([
        {
          zipcode: '67871',
          similarity_score: '316'
        },
        {
          zipcode: '30251',
          similarity_score: '425'
        },
        {
          zipcode: '28555',
          similarity_score: '433'
        },
        {
          zipcode: '45623',
          similarity_score: '445'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/similar-zipcodes/48416')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sourceZipcode');
      expect(response.body.data).toHaveProperty('similarZipcodes');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.sourceZipcode).toBe('48416');
      expect(response.body.data.similarZipcodes).toHaveLength(4);
      expect(response.body.data.similarZipcodes[0]).toHaveProperty('zipcode');
      expect(response.body.data.similarZipcodes[0]).toHaveProperty('similarityScore');
      expect(response.body.data.analysis).toHaveProperty('count');
      expect(response.body.data.analysis).toHaveProperty('method');
    });

    it('should handle ZIP codes with no similar matches', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSimilarZipcodes.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/analytics/similar-zipcodes/99999')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });
  });

  describe('GET /api/v1/analytics/similar-cities/:city/:state', () => {
    it('should return similar cities data', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSimilarCities.mockResolvedValue([
        {
          city: 'Austin',
          state: 'TX',
          totalpopulation: 950000,
          meanincome: 75000,
          avgmedianlistingprice: 450000,
          policestations: 5,
          policeofficers: 120,
          numhospitals: 8,
          numchildcarecenters: 45,
          firefighterdepartments: 3,
          firefighters: 85,
          obesityrate: 25.5,
          asthmarate: 8.2,
          depressionrate: 12.1,
          similarity_score: '156.8'
        },
        {
          city: 'Dallas',
          state: 'TX',
          totalpopulation: 1300000,
          meanincome: 68000,
          avgmedianlistingprice: 380000,
          policestations: 7,
          policeofficers: 150,
          numhospitals: 12,
          numchildcarecenters: 60,
          firefighterdepartments: 4,
          firefighters: 110,
          obesityrate: 28.1,
          asthmarate: 9.5,
          depressionrate: 14.2,
          similarity_score: '234.5'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/similar-cities/Houston/TX')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sourceCity');
      expect(response.body.data).toHaveProperty('sourceState');
      expect(response.body.data).toHaveProperty('similarCities');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.sourceCity).toBe('Houston');
      expect(response.body.data.sourceState).toBe('TX');
      expect(response.body.data.similarCities).toHaveLength(2);
      expect(response.body.data.similarCities[0]).toHaveProperty('city');
      expect(response.body.data.similarCities[0]).toHaveProperty('state');
      expect(response.body.data.similarCities[0]).toHaveProperty('similarityScore');
      expect(response.body.data.analysis).toHaveProperty('count');
      expect(response.body.data.analysis).toHaveProperty('method');
    });

    it('should handle cities with no similar matches', async () => {
      // Mock repository response
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSimilarCities.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/analytics/similar-cities/NonexistentCity/XX')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock repository error
      const analyticsRepository = require('../../repositories/analyticsRepository');
      analyticsRepository.getSafetyToSaleRatio.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/v1/analytics/safety-sale-ratio')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 