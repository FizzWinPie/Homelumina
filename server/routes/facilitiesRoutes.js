const express = require('express');
const router = express.Router();

// Import controllers
const FacilitiesController = require('../controllers/facilitiesController');

// Import utilities
const ResponseUtils = require('../utils/responseUtils');
const { 
  isValidZipcode, 
  isValidCity 
} = require('../utils/validationUtils');

// Import middleware
const { asyncHandler } = require('../middlewareLib/errorHandler');
const { 
  validateLimit, 
  validateRequest 
} = require('../middlewareLib/validation/validationExports');
const { logger } = require('../utils/logger');

/**
 * Enhanced Facilities Routes v2 - Updated for REST Best Practices
 * Uses query parameters for variable resource filtering (ZIP codes, cities)
 * Replaces route logic with controller calls
 * Adds comprehensive middleware for validation, error handling, logging, and security
 */

// Apply general validation to all routes
router.use(validateRequest);

/**
 * GET /facilities/top
 * Get top facilities by ZIP code using query parameters
 * Example: /facilities/top?zipcode=19104&limit=5
 */
router.get('/top', 
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { zipcode, limit = 10 } = req.query;

    // Validate ZIP code if provided
    if (!zipcode) {
      return res.status(400).json(ResponseUtils.formatError(
        'ZIP code is required as a query parameter',
        400,
        req.originalUrl,
        { example: '/facilities/top?zipcode=19104&limit=5' }
      ));
    }

    if (!isValidZipcode(zipcode)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid ZIP code format. Must be 5 digits.',
        400,
        req.originalUrl,
        { zipcode }
      ));
    }

    logger.info('Fetching top facilities', { zipcode, limit });

    // Use controller for business logic instead of inline SQL
    const response = await FacilitiesController.getTopFacilitiesByZipcode(zipcode, limit);

    logger.info('Top facilities retrieved successfully', { 
      zipcode, 
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /facilities/search
 * Search facilities with multiple parameters using query parameters
 * Example: /facilities/search?zipcode=19104&city=Philadelphia&type=childcare&limit=10
 */
router.get('/search',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { 
      zipcode, 
      city, 
      facilityType, 
      limit = 10 
    } = req.query;

    logger.info('Searching facilities', { zipcode, city, facilityType, limit });

    // Validate ZIP code if provided
    if (zipcode && !isValidZipcode(zipcode)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid ZIP code format. Must be 5 digits.',
        400,
        req.originalUrl,
        { zipcode }
      ));
    }

    // Validate city if provided
    if (city && !isValidCity(city)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid city name format.',
        400,
        req.originalUrl,
        { city }
      ));
    }

    // Use controller for business logic
    const response = await FacilitiesController.searchFacilities({
      zipcode,
      city,
      facilityType,
      limit: parseInt(limit)
    });

    logger.info('Facility search completed', { 
      criteria: { zipcode, city, facilityType },
      count: response.data.length
    });

    res.json(response);
  })
);

/**
 * GET /facilities/childcare
 * Get childcare facilities by city using query parameters
 * Example: /facilities/childcare?city=Philadelphia&limit=10
 */
router.get('/childcare',
  validateLimit,          // Validate limit parameter
  asyncHandler(async (req, res) => {
    const { city, limit = 10 } = req.query;

    // Validate city if provided
    if (!city) {
      return res.status(400).json(ResponseUtils.formatError(
        'City is required as a query parameter',
        400,
        req.originalUrl,
        { example: '/facilities/childcare?city=Philadelphia&limit=10' }
      ));
    }

    if (!isValidCity(city)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid city name format.',
        400,
        req.originalUrl,
        { city }
      ));
    }

    logger.info('Fetching childcare facilities by city', { city, limit });

    // Use controller for business logic
    const response = await FacilitiesController.getChildcareByCity(city, limit);
    
    // Add city info to response
    response.city = city;

    logger.info('Childcare facilities retrieved successfully', { 
      city, 
      count: response.data.length 
    });

    res.json(response);
  })
);

/**
 * GET /facilities/count
 * Get facilities count by type using query parameters
 * Example: /facilities/count?zipcode=19104
 */
router.get('/count',
  asyncHandler(async (req, res) => {
    const { zipcode } = req.query;

    // Validate ZIP code if provided
    if (!zipcode) {
      return res.status(400).json(ResponseUtils.formatError(
        'ZIP code is required as a query parameter',
        400,
        req.originalUrl,
        { example: '/facilities/count?zipcode=19104' }
      ));
    }

    if (!isValidZipcode(zipcode)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid ZIP code format. Must be 5 digits.',
        400,
        req.originalUrl,
        { zipcode }
      ));
    }

    logger.info('Fetching facilities count', { zipcode });

    // Use controller for business logic
    const result = await FacilitiesController.getFacilitiesCountByType(zipcode);
    
    const response = ResponseUtils.formatSuccess(result.data, {
      zipcode,
      total: result.data ? result.data.length : 0
    });

    logger.info('Facilities count retrieved successfully', { 
      zipcode, 
      total: response.total 
    });

    res.json(response);
  })
);


/**
 * GET /api/v1/facilities/validate/:zipcode
 * Validates a ZIP code for facilities using path parameter
 */
router.get('/validate/:zipcode', asyncHandler(async (req, res) => {
  const { zipcode } = req.params;
  logger.info('Validating ZIP code', { zipcode });
  const response = await FacilitiesController.validateZipcode(zipcode);
  logger.info('ZIP code validation completed', { zipcode, isValid: response.data?.isValid });
  if (response.success === false) {
    return res.status(400).json(response);
  }
  res.json(response);
}));

/**
 * GET /facilities/stats
 * Get overall facilities statistics
 */
router.get('/stats',
  asyncHandler(async (req, res) => {
    const { city = 'Philadelphia' } = req.query;

    logger.info('Fetching facilities statistics', { city });

    try {
      // Use controller methods to gather statistics
      const childcareStats = await FacilitiesController.getAverageChildcareByCriteria(city, 0);
      
      const response = ResponseUtils.formatStatistics(childcareStats, city);

      logger.info('Facilities statistics retrieved successfully', { 
        city, 
        childcareCenters: childcareStats.total_centers 
      });

      res.json(response);
    } catch (error) {
      logger.error('Error fetching facilities statistics', { error: error.message });
      throw error;
    }
  })
);

module.exports = router;
