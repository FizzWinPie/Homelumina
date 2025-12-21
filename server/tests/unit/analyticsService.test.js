const analyticsService = require('../../services/analyticsService');
const analyticsRepository = require('../../repositories/analyticsRepository');

// Mock the analytics repository
jest.mock('../../repositories/analyticsRepository');

describe('Analytics Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCityGrowthRate', () => {
    it('should return city growth rate data when repository returns data', async () => {
      // Mock repository response
      const mockData = {
        city: 'Houston',
        state: 'TX',
        growthrate3year: '5.25%'
      };
      analyticsRepository.getCityGrowthRate.mockResolvedValue(mockData);

      const result = await analyticsService.getCityGrowthRate('Houston', 'TX');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        city: 'Houston',
        state: 'TX',
        growthRate3Year: '5.25%',
        analysis: {
          period: '2022-2025',
          description: expect.any(String)
        }
      });
    });

    it('should return success: true with null data when repository returns null', async () => {
      // Mock repository response
      analyticsRepository.getCityGrowthRate.mockResolvedValue(null);

      const result = await analyticsService.getCityGrowthRate('NonexistentCity', 'XX');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toContain('No growth rate data found');
    });

    it('should throw error when city or state is missing', async () => {
      await expect(analyticsService.getCityGrowthRate('', 'TX')).rejects.toThrow('City and state are required');
      await expect(analyticsService.getCityGrowthRate('Houston', '')).rejects.toThrow('City and state are required');
    });
  });

  describe('getSimilarZipcodes', () => {
    it('should return similar ZIP codes data when repository returns data', async () => {
      // Mock repository response
      const mockData = [
        { zipcode: '19103', similarity_score: 0.95 },
        { zipcode: '19102', similarity_score: 0.93 }
      ];
      analyticsRepository.getSimilarZipcodes.mockResolvedValue(mockData);

      const result = await analyticsService.getSimilarZipcodes('19104');

      expect(result.success).toBe(true);
      expect(result.data.sourceZipcode).toBe('19104');
      expect(result.data.similarZipcodes).toHaveLength(2);
      expect(result.data.similarZipcodes[0]).toEqual({
        zipcode: '19103',
        similarityScore: 0.95
      });
    });

    it('should return success: true with null data when repository returns empty array', async () => {
      // Mock repository response
      analyticsRepository.getSimilarZipcodes.mockResolvedValue([]);

      const result = await analyticsService.getSimilarZipcodes('99999');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toContain('No similar ZIP codes found');
    });
  });

  describe('getSimilarCities', () => {
    it('should return similar cities data when repository returns data', async () => {
      // Mock repository response
      const mockData = [
        { city: 'Dallas', state: 'TX', similarity_score: 0.92 },
        { city: 'Austin', state: 'TX', similarity_score: 0.90 }
      ];
      analyticsRepository.getSimilarCities.mockResolvedValue(mockData);

      const result = await analyticsService.getSimilarCities('Houston', 'TX');

      expect(result.success).toBe(true);
      expect(result.data.sourceCity).toBe('Houston');
      expect(result.data.sourceState).toBe('TX');
      expect(result.data.similarCities).toHaveLength(2);
      expect(result.data.similarCities[0]).toEqual({
        city: 'Dallas',
        state: 'TX',
        similarityScore: 0.92
      });
    });

    it('should return success: true with null data when repository returns empty array', async () => {
      // Mock repository response
      analyticsRepository.getSimilarCities.mockResolvedValue([]);

      const result = await analyticsService.getSimilarCities('NonexistentCity', 'XX');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toContain('No similar cities found');
    });
  });
}); 