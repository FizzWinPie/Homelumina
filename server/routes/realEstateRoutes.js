const express = require('express');
const router = express.Router();

// Import controllers
const RealEstateController = require('../controllers/realEstateController');

// Import utilities
const ResponseUtils = require('../utils/responseUtils');
const { 
  isValidZipcode, 
  isValidPrice 
} = require('../utils/validationUtils');

// Import middleware
const { asyncHandler } = require('../middlewareLib/errorHandler');
const { 
  validateLimit, 
  validateZipcode,
  validateCity,
  validateState,
  validateCityQuery,      // <-- added
  validateStateQuery,     // <-- added
  validateRequest 
} = require('../middlewareLib/validation/validationExports');
const { logger } = require('../utils/logger');

/**
 * Enhanced Real Estate Routes
 * Updated to work with ZIP code-based data from localmarket table
 * Replaces route logic with controller calls
 * Adds comprehensive middleware for validation, error handling, logging, and security
 */

// Apply general validation to all routes
router.use(validateRequest);

/**
 * GET /real-estate/lowest-prices
 * Returns lowest median home prices
 */
router.get('/lowest-prices',
  validateLimit,
  async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      logger.info('Fetching lowest home prices', { limit });
      const response = await RealEstateController.getLowestMedianHomePrices(limit);
      logger.info('Lowest home prices retrieved successfully', { count: response.data?.length });
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /real-estate/prices/zipcode-range
 * Returns real estate prices within a ZIP code range
 */
router.get('/prices/zipcode-range',
  asyncHandler(async (req, res) => {
    const { minZipcode, maxZipcode } = req.query;

    if (!minZipcode || !maxZipcode) {
      throw new Error('Both minZipcode and maxZipcode parameters are required');
    }

    // Validate ZIP code format for both parameters using validation utilities
    if (!isValidZipcode(minZipcode) || !isValidZipcode(maxZipcode)) {
      throw new Error('Invalid ZIP code format. Both minZipcode and maxZipcode must be 5 digits.');
    }

    logger.info('Fetching real estate prices by ZIP code range', { minZipcode, maxZipcode });

    // Use controller for business logic
    const response = await RealEstateController.getPricesByZipcodeRange(minZipcode, maxZipcode);

    logger.info('ZIP code range real estate prices retrieved successfully', { 
      minZipcode, 
      maxZipcode, 
      count: prices.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/statistics/:zipcode
 * Returns home price statistics for a specific ZIP code
 */
router.get('/statistics/:zipcode',
  validateZipcode,        // Validate ZIP code format
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;

    logger.info('Fetching home price statistics by ZIP code', { zipcode });

    // Use controller for business logic
    const statistics = await RealEstateController.getStatisticsByZipcode(zipcode);
    
    const response = ResponseUtils.formatStatistics(statistics, zipcode);

    logger.info('Home price statistics completed', { 
      zipcode,
      avgPrice: statistics?.avg_price 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/affordable
 * Returns affordable ZIP codes based on maximum price
 */
router.get('/affordable',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { maxPrice = 300000, limit = 20 } = req.query;

    logger.info('Fetching affordable ZIP codes', { maxPrice, limit });

    // Use controller for business logic
    const response = await RealEstateController.getAffordableHousing(maxPrice, limit);

    logger.info('Affordable ZIP codes retrieved successfully', { 
      maxPrice, 
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/affordable-zipcodes
 * Returns affordable ZIP codes by city and state
 */
router.get('/affordable-zipcodes',
  validateCityQuery,      // Validate city query parameter
  validateStateQuery,     // Validate state query parameter
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { city, state, maxPrice = 300000, limit = 20 } = req.query;

    logger.info('Fetching affordable ZIP codes by city and state', { city, state, maxPrice, limit });

    // Use controller for business logic
    const response = await RealEstateController.getAffordableZipCodesByCity(maxPrice, city, state, limit);

    logger.info('Affordable ZIP codes by city retrieved successfully', { 
      city, 
      state,
      maxPrice, 
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/search
 * Search properties with various filters
 */
router.get('/search',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    logger.debug('Entered /real-estate/search route handler', { query: req.query });
    const { zipcode, minPrice, maxPrice, bedrooms, limit = 10 } = req.query;

    logger.info('Searching for properties', { zipcode, minPrice, maxPrice, bedrooms, limit });

    // Validate parameters using validation utilities
    if (zipcode && !isValidZipcode(zipcode)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid ZIP code format. Must be 5 digits.',
        400,
        req.originalUrl
      ));
    }

    if (minPrice && !isValidPrice(minPrice)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Min price must be a positive number',
        400,
        req.originalUrl
      ));
    }

    if (maxPrice && !isValidPrice(maxPrice)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Max price must be a positive number',
        400,
        req.originalUrl
      ));
    }

    if (minPrice && maxPrice && !isValidPrice(minPrice) && !isValidPrice(maxPrice)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Min price cannot be greater than max price',
        400,
        req.originalUrl
      ));
    }

    if (bedrooms && !isValidPrice(bedrooms)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Bedrooms must be a positive number',
        400,
        req.originalUrl
      ));
    }

    // Use controller for business logic
    const response = await RealEstateController.searchProperties({
      zipcode,
      minPrice,
      maxPrice,
      bedrooms,
      limit
    });

    logger.info('Property search completed successfully', { 
      zipcode,
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/average-prices
 * Returns average property prices
 */
router.get('/average-prices',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Fetching average property prices', { limit });

    // Use controller for business logic
    const response = await RealEstateController.getAveragePrices(limit);

    logger.info('Average property prices retrieved successfully', { 
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/compare-zipcodes
 * Compare home price statistics between two ZIP codes
 */
router.get('/compare-zipcodes',
  asyncHandler(async (req, res) => {
    const { zipcode1, zipcode2 } = req.query;

    if (!zipcode1 || !zipcode2) {
      throw new Error('Both zipcode1 and zipcode2 parameters are required');
    }

    // Validate ZIP code format using validation utilities
    if (!isValidZipcode(zipcode1) || !isValidZipcode(zipcode2)) {
      throw new Error('Invalid ZIP code format. Both zipcode1 and zipcode2 must be 5 digits.');
    }

    logger.info('Comparing real estate data between ZIP codes', { zipcode1, zipcode2 });

    try {
      // Use controller methods to get data for both ZIP codes
      const stats1 = await RealEstateController.getStatisticsByZipcode(zipcode1);
      const stats2 = await RealEstateController.getStatisticsByZipcode(zipcode2);

      // Extract avg_price from statistics and convert to numbers
      const avgPrice1 = Number(stats1?.statistics?.avg_price || 0);
      const avgPrice2 = Number(stats2?.statistics?.avg_price || 0);

      const response = {
        success: true,
        comparison: {
          zipcode1: {
            zipcode: zipcode1,
            statistics: stats1
          },
          zipcode2: {
            zipcode: zipcode2,
            statistics: stats2
          },
          difference: {
            avgPriceDiff: avgPrice1 - avgPrice2,
            avgPriceDiffPercent: avgPrice2 ? (((avgPrice1 - avgPrice2) / avgPrice2) * 100).toFixed(2) : 'N/A'
          }
        },
        timestamp: new Date().toISOString()
      };

      logger.info('ZIP code comparison completed successfully', { 
        zipcode1, 
        zipcode2,
        avgPriceDiff: response.comparison.difference.avgPriceDiff 
      });

      res.json(response);
    } catch (error) {
      logger.error('Error comparing ZIP codes', { error: error.message });
      throw error;
    }
  })
);

/**
 * GET /real-estate/validate-price-range
 * Validate if a price range is reasonable
 */
router.get('/validate-price-range',
  asyncHandler(async (req, res) => {
    const { minPrice, maxPrice } = req.query;

    // Use controller validation method
    const isValid = RealEstateController.validateRealEstateParams({ minPrice, maxPrice });
    
    const response = {
      success: true,
      minPrice: minPrice,
      maxPrice: maxPrice,
      isValid: isValid,
      message: isValid ? 'Valid price range' : 'Invalid price range',
      timestamp: new Date().toISOString()
    };

    logger.info('Price range validation completed', { minPrice, maxPrice, isValid });

    res.json(response);
  })
);

/**
 * GET /real-estate/highest-prices
 * Returns highest median home prices
 */
router.get('/highest-prices',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { limit = 10, monthdate } = req.query;

    logger.info('Fetching highest home prices', { limit, monthdate });

    // Use controller for business logic
    const response = await RealEstateController.getHighestMedianHomePrices(limit, monthdate);

    logger.info('Highest home prices retrieved successfully', { 
      count: response.data?.length,
      monthdate: monthdate || 'all'
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/lowest-prices/:zipcode
 * Returns lowest price properties for a specific zipcode
 */
router.get('/lowest-prices/:zipcode',
  validateZipcode,        // Validate ZIP code format
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;
    const { limit = 10 } = req.query;

    logger.info('Fetching lowest price properties for ZIP code', { zipcode, limit });

    // Use controller for business logic
    const response = await RealEstateController.getLowestPrices(limit);

    logger.info('Lowest price properties retrieved successfully', { 
      zipcode,
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/price-analysis/:zipcode
 * Returns detailed price analysis for a specific ZIP code
 */
router.get('/price-analysis/:zipcode',
  validateZipcode,        // Validate ZIP code format
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;

    logger.info('Fetching price analysis for ZIP code', { zipcode });

    // Use controller for business logic
    const response = await RealEstateController.getStatisticsByZipcode(zipcode);

    logger.info('Price analysis retrieved successfully', { 
      zipcode,
      avgPrice: response.data?.averagePrice 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/price-trends/:zipcode
 * Returns market trends over time (median listing price and month date) for a ZIP code
 * Can be mapped into a chart component for location and comparison pages
 */
router.get('/price-trends/:zipcode',
  validateZipcode,        // Validate ZIP code format
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;

    logger.info('Fetching price trends by ZIP code', { zipcode });

    // Use controller for business logic
    const result = await RealEstateController.getPriceTrends(zipcode);

    logger.info('Price trends retrieved successfully', { 
      zipcode,
      dataPoints: result.data?.length || 0
    });

    res.json(result);
  })
);

/**
 * GET /real-estate/lowest-price-zipcode/:city/:state
 * Returns the zipcode with the lowest median home price in a city
 */
router.get('/lowest-price-zipcode/:city/:state',
  validateCity,           // Validate city parameter
  validateState,          // Validate state parameter
  asyncHandler(async (req, res) => {
    const { city, state } = req.params;

    logger.info('Fetching lowest median home price ZIP code for city', { city, state });

    // Use controller for business logic
    const response = await RealEstateController.getZipcodeWithLowestMedianHomePriceInCity(city, state);

    logger.info('Lowest median home price ZIP code retrieved successfully', { 
      city,
      zipcode: response.data?.zipcode 
    });

    res.json(response);
  })
);

/**
 * GET /real-estate/stats-by-zipcode
 * Returns real estate statistics for a specific ZIP code
 */
router.get('/stats-by-zipcode',
  asyncHandler(async (req, res) => {
    const { zipcode } = req.query;
    logger.info('Fetching real estate stats by zipcode', { zipcode });
    const response = await RealEstateController.getStatisticsByZipcode(zipcode);
    logger.info('Real estate stats by zipcode retrieved successfully', { zipcode });
    res.json(response);
  })
);

/**
 * GET /real-estate/validate-zipcode/:zipcode
 * Validates if a ZIP code exists in the real estate data
 */
router.get('/validate-zipcode/:zipcode',
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;
    logger.info('Validating real estate zipcode', { zipcode });
    const isValid = await RealEstateController.validateZipcode(zipcode);
    logger.info('Real estate zipcode validation completed', { zipcode, isValid });
    res.json({ success: true, zipcode, isValid });
  })
);

module.exports = router; 