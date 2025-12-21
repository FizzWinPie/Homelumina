const express = require('express');
const { 
  validateLimit, 
  validateZipcode, 
  validateCityQuery,
  validateStateQuery,
  validatePrice,
  validateRequest
} = require('../middlewareLib/validation/validationExports');
const { asyncHandler } = require('../middlewareLib/errorHandler');
const AnalyticsController = require('../controllers/analyticsController');
const ResponseUtils = require('../utils/responseUtils');
const { logger } = require('../utils/logger');
const { 
  createSimpleRouteHandler, 
  createAnalyticsRouteHandler 
} = require('../utils/routeUtils');

const router = express.Router();

/**
 * Enhanced Analytics Routes
 * Replaces old analytics endpoints with controller-based architecture
 * Adds comprehensive middleware for validation, error handling, logging, and security
 */

// Apply general validation to all routes
router.use(validateRequest);

/**
 * GET /analytics/underserved-zipcodes
 * Get underserved ZIP codes based on facility density
 */
router.get('/underserved-zipcodes',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Fetching underserved ZIP codes', { limit });

    // Use controller for business logic
    const result = await AnalyticsController.getUnderservedZipcodes(limit);

    logger.info('Underserved ZIP codes retrieved successfully', { 
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/growth-leaders
 * Get growth leaders based on real estate price trends
 */
router.get('/growth-leaders',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Fetching growth leaders', { limit });

    // Use controller for business logic
    const result = await AnalyticsController.getGrowthLeaders(limit);

    logger.info('Growth leaders retrieved successfully', { 
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/hospital-distance-by-price
 * Get hospital distance analysis by price tier
 */
router.get('/hospital-distance-by-price',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Fetching hospital distance by price', { limit });

    // Use controller for business logic
    const result = await AnalyticsController.getHospitalDistanceByPrice(limit);

    logger.info('Hospital distance by price retrieved successfully', { 
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/safety-sale-ratio
 * Returns safety to sale ratio analysis
 */
router.get('/safety-sale-ratio',
  validateLimit,
  validateCityQuery,
  asyncHandler(async (req, res) => {
    const { city, limit = 10 } = req.query;
    
    logger.info('Fetching safety to sale ratio', { city, limit });

    // Use controller for business logic
    const result = await AnalyticsController.getSafetyToSaleRatio(city, limit);

    logger.info('Safety to sale ratio retrieved successfully', { 
      city,
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/facilities-population
 * Returns facilities to population ratio analysis
 */
router.get('/facilities-population',
  validateZipcode,
  asyncHandler(async (req, res) => {
    const { zipcode, limit = 10 } = req.query;
    
    logger.info('Fetching facilities to population ratio', { zipcode, limit });

    // Use controller for business logic
    const result = await AnalyticsController.getFacilitiesToPopulationRatio(zipcode, limit);

    logger.info('Facilities to population ratio retrieved successfully', { 
      zipcode,
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/facilities-to-population
 * Returns facilities to population ratio analysis for all zipcodes in a city
 */
router.get('/facilities-to-population',
  validateCityQuery,      // Validate city query parameter
  validateStateQuery,     // Validate state query parameter
  asyncHandler(async (req, res) => {
    const { city, state } = req.query;
    
    logger.info('Fetching facilities to population ratio by city', { city, state });

    // Use controller for business logic
    const result = await AnalyticsController.getFacilitiesToPopulationByCity(city, state);

    logger.info('Facilities to population ratio by city retrieved successfully', { 
      city, 
      state,
      hasData: !!result.data 
    });

    res.json(result);
  })
);

/**
 * GET /analytics/affordable-zipcodes
 * Get affordable ZIP codes
 */
router.get('/affordable-zipcodes',
  validateLimit,
  validatePrice,
  asyncHandler(async (req, res) => {
    const { maxPrice = 300000, limit = 20 } = req.query;

    logger.info('Fetching affordable ZIP codes', { maxPrice, limit });

    // Use controller for business logic
    const result = await AnalyticsController.getAffordableZipcodes(maxPrice, limit);

    logger.info('Affordable ZIP codes retrieved successfully', { 
      maxPrice, 
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/underserved-healthcare
 * Get underserved healthcare analysis
 */
router.get('/underserved-healthcare',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Fetching underserved healthcare data', { limit });

    // Use controller for business logic
    const result = await AnalyticsController.getUnderservedHealthcare(limit);
    const response = AnalyticsController.formatAnalyticsResponse(result.data, 'underserved_healthcare');

    logger.info('Underserved healthcare data retrieved successfully', { 
      count: result.data ? result.data.length : 0
    });

    res.json(response);
  })
);

/**
 * GET /analytics/homepage-featured-zipcodes
 * Get homepage featured ZIP codes with population >= 2000 that have both good social service resources and healthcare resources
 */
router.get('/homepage-featured-zipcodes',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 4 } = req.query;

    logger.info('Fetching homepage featured ZIP codes', { limit });

    // Use controller for business logic
    const result = await AnalyticsController.getHomepageFeaturedZipcodes(parseInt(limit));

    logger.info('Homepage featured ZIP codes retrieved successfully', { 
      limit,
      count: result.data ? result.data.length : 0
    });

    res.json(result);
  })
);

/**
 * GET /analytics/location/:zipcode
 * Get location page data for a specific ZIP code
 */
router.get('/location/:zipcode',
  validateZipcode,
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;

    logger.info('Fetching location page data', { zipcode });

    // Use controller for business logic
    const result = await AnalyticsController.getLocationPageData(zipcode);

    logger.info('Location page data retrieved successfully', { 
      zipcode,
      hasData: !!result.data 
    });

    res.json(result);
  })
);

/**
 * GET /analytics/summary
 * Get comprehensive analytics summary
 */
router.get('/summary',
  asyncHandler(async (req, res) => {
    logger.info('Fetching analytics summary');

    try {
      // Get various analytics data for summary
      const [underservedZipcodesRes, growthLeadersRes, affordableZipcodesRes] = await Promise.all([
        AnalyticsController.getUnderservedZipcodes(5),
        AnalyticsController.getGrowthLeaders(5),
        AnalyticsController.getAffordableZipcodes(300000, 5)
      ]);

      const underservedZipcodes = underservedZipcodesRes.data || [];
      const growthLeaders = growthLeadersRes.data || [];
      const affordableZipcodes = affordableZipcodesRes.data || [];

      const summary = {
        underserved_zipcodes: {
          count: underservedZipcodes.length,
          critical_count: underservedZipcodes.filter(z => z.underserved_level === 'Critical').length
        },
        growth_leaders: {
          count: growthLeaders.length,
          avg_price: growthLeaders.length > 0 ? 
            Math.round(growthLeaders.reduce((sum, item) => sum + parseFloat(item.avg_price), 0) / growthLeaders.length) : 0
        },
        affordable_zipcodes: {
          count: affordableZipcodes.length,
          very_affordable_count: affordableZipcodes.filter(z => z.affordability_level === 'Very Affordable').length
        }
      };
      
      const response = ResponseUtils.formatSuccess(summary, { type: 'analytics_summary' });

      logger.info('Analytics summary retrieved successfully', { 
        underserved_count: underservedZipcodes.length,
        growth_count: growthLeaders.length,
        affordable_count: affordableZipcodes.length
      });

      res.json(response);
    } catch (error) {
      logger.error('Error fetching analytics summary', { error: error.message });
      throw error;
    }
  })
);

/**
 * GET /analytics/market-trends
 * Get market trends analysis
 */
router.get('/market-trends',
  asyncHandler(async (req, res) => {
    const { city, months = 6 } = req.query;

    logger.info('Fetching market trends', { city, months });

    try {
      // Use controller for business logic
      const data = await AnalyticsController.getMarketTrends(city, months);
      logger.info('Market trends retrieved successfully', { 
        city,
        months,
        count: data.length 
      });
      res.json(ResponseUtils.formatSuccess(data));
    } catch (error) {
      // If error is due to invalid months parameter, return 400
      if (error.message && error.message.includes('Months must be between 1 and 24')) {
        logger.warn('Invalid months parameter for market trends', { city, months, error: error.message });
        return res.status(400).json(ResponseUtils.formatError(
          error.message,
          400,
          req.originalUrl
        ));
      }
      // Otherwise, return 500
      logger.error('Error fetching market trends', { city, months, error: error.message });
      res.status(500).json(ResponseUtils.formatError(
        'Internal server error',
        500,
        req.originalUrl
      ));
    }
  })
);

/**
 * GET /analytics/zipcode-comparison
 * Get zipcode comparison analysis
 */
router.get('/zipcode-comparison',
  asyncHandler(async (req, res) => {
    const { zipcodes } = req.query;

    logger.info('Fetching zipcode comparison', { zipcodes });

    // Use controller for business logic
    const data = await AnalyticsController.getZipcodeComparison(zipcodes);

    logger.info('Zipcode comparison retrieved successfully', { 
      zipcodes,
      count: data.length 
    });

    res.json(ResponseUtils.formatSuccess(data));
  })
);

/**
 * GET /analytics/validate-params
 * Validate analytics parameters
 */
router.get('/validate-params',
  asyncHandler(async (req, res) => {
    const { limit, maxPrice } = req.query;

    try {
      // Use controller validation method
      AnalyticsController.validateAnalyticsParams({ limit, maxPrice });
      
      const response = ResponseUtils.formatSuccess({
        parameters: { limit, maxPrice },
        isValid: true,
        message: 'Parameters are valid'
      });

      logger.info('Analytics parameters validation completed', { limit, maxPrice, isValid: true });

      res.json(response);
    } catch (error) {
      const response = ResponseUtils.formatError(
        error.message,
        400,
        req.originalUrl,
        { parameters: { limit, maxPrice }, isValid: false }
      );

      logger.error('Analytics parameters validation failed', { limit, maxPrice, isValid: false, error: error.message });

      res.status(400).json(response);
    }
  })
);

/**
 * GET /analytics/city-comparison/:city/:state
 * Get city-level aggregate comparison for hospitals, police, firefighters, income, population, and health data
 */
router.get('/city-comparison/:city/:state',
  asyncHandler(async (req, res) => {
    const { city, state } = req.params;
    logger.info('Fetching city aggregate comparison', { city, state });
    const result = await AnalyticsController.getCityAggregateComparison(city, state);
    logger.info('City aggregate comparison retrieved successfully', { city, state, hasData: !!result.data });
    res.json(result);
  })
);

/**
 * GET /analytics/city-aggregate-comparison
 * Returns city-level aggregate comparison for hospitals, police, firefighters, income, population, and health data
 */
router.get('/city-aggregate-comparison',
  validateCityQuery,      // Validate city query parameter
  validateStateQuery,     // Validate state query parameter
  asyncHandler(async (req, res) => {
    const { city1, city2, state1, state2 } = req.query;

    logger.info('Fetching city aggregate comparison data', { city1, city2, state1, state2 });

    // For now, we'll use city1 and state1 as the primary city
    // TODO: Extend to support comparison between two cities
    const response = await AnalyticsController.getCityAggregateComparison(city1, state1);

    logger.info('City aggregate comparison data retrieved successfully', { city1, state1 });

    res.json(response);
  })
);

/**
 * GET /analytics/city-growth-rate/:city/:state
 * Get city growth rate between 2022 and 2025
 */
router.get('/city-growth-rate/:city/:state',
  asyncHandler(async (req, res) => {
    const { city, state } = req.params;
    logger.info('Fetching city growth rate', { city, state });
    const result = await AnalyticsController.getCityGrowthRate(city, state);
    logger.info('City growth rate retrieved successfully', { city, state, hasData: !!result.data });
    res.json(result);
  })
);

/**
 * GET /analytics/similar-zipcodes/:zipcode
 * Get the 4 most similar ZIP codes to a given ZIP code based on weighted attributes
 */
router.get('/similar-zipcodes/:zipcode',
  validateZipcode,        // Validate ZIP code format
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;
    
    logger.info('Fetching similar ZIP codes', { zipcode });
    
    const result = await AnalyticsController.getSimilarZipcodes(zipcode);
    
    logger.info('Similar ZIP codes retrieved successfully', { 
      zipcode,
      count: result.data?.similarZipcodes?.length || 0
    });
    
    res.json(result);
  })
);

/**
 * GET /analytics/similar-cities/:city/:state
 * Get similar cities based on various metrics
 */
router.get('/similar-cities/:city/:state',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { city, state } = req.params;
    const { limit = 10 } = req.query;

    logger.info('Fetching similar cities', { city, state, limit });

    // Use controller for business logic
    const response = await AnalyticsController.getSimilarCities(city, state, limit);

    logger.info('Similar cities retrieved successfully', { 
      city, 
      state,
      count: response.data ? response.data.length : 0
    });

    res.json(response);
  })
);

module.exports = router; 