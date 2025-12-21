const express = require('express');
const router = express.Router();

// Import controllers
const SearchController = require('../controllers/searchController');

// Import utilities
const ResponseUtils = require('../utils/responseUtils');

// Import middleware
const { asyncHandler } = require('../middlewareLib/errorHandler');
const { 
  validateLimit, 
  validateRequest,
  validateStateQuery,
  validatePriceRange,
  validateZipcodeSummaries
} = require('../middlewareLib/validation/validationExports');
const { logger } = require('../utils/logger');

// Import IP geolocation utilities
const { getUserLocationFromIP, getClientIP } = require('../utils/ipGeolocation');

// Import cache utilities
const featuredCitiesCache = require('../utils/featuredCitiesCache');
const queryLoader = require("../utils/queryLoader");
const db = require("../config/database");

/**
 * Search Routes
 * Provides autocomplete and search functionality for ZIP codes, cities, and states
 */

// Apply general validation to all routes
router.use(validateRequest);

/**
 * GET /search/featured-cities
 * Get featured cities based on affordability and health metrics
 * Example: /search/featured-cities?limit=3
 */
router.get('/featured-cities',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { limit = 3 } = req.query;

    logger.info('Fetching featured cities', { limit });

    // Use controller for business logic
    const response = await SearchController.getFeaturedCities(parseInt(limit));

    logger.info('Featured cities retrieved successfully', { 
      count: response.data?.cities?.length || 0
    });

    res.json(response);
  })
);

/**
 * GET /search/featured-cities/location-based
 * Get location-based featured cities based on user's IP geolocation
 */
router.get('/featured-cities/location-based',
  asyncHandler(async (req, res) => {
    try {
      const limit = req.query.limit || 3;
      const clientIP = getClientIP(req);
      
      logger.info('Getting location-based featured cities', { 
        clientIP, 
        limit 
      });
      
      // Get user location from IP
      const userLocation = await getUserLocationFromIP(clientIP);
      
      if (!userLocation) {
        logger.warn('Could not determine user location, falling back to default featured cities');
        const fallbackResponse = await SearchController.getDefaultFeaturedCities(parseInt(limit));
        res.json(fallbackResponse);
        return;
      }
      
      // If user is not from US, return default featured cities
      if (userLocation.country && userLocation.country !== 'US') {
        logger.info('User is not from US, returning default featured cities', {
          country: userLocation.country,
          city: userLocation.city,
          state: userLocation.state
        });
        const fallbackResponse = await SearchController.getDefaultFeaturedCitiesForNonUS(parseInt(limit));
        res.json(fallbackResponse);
        return;
      }
      
      // Get location-based featured cities
      const result = await SearchController.getLocationBasedFeaturedCities(
        userLocation.city, 
        userLocation.state, 
        parseInt(limit)
      );
      
      // Add userLocation to the existing result
      result.data.userLocation = {
        city: userLocation.city,
        state: userLocation.state,
        country: userLocation.country
      };
      
      res.json(result);
      
    } catch (error) {
      logger.error('Error in location-based featured cities', { error: error.message });
      res.status(500).json(ResponseUtils.formatError('Failed to get location-based featured cities', error.message));
    }
  })
);

/**
 * GET /search/autocomplete
 * Get autocomplete suggestions for ZIP codes, cities, and states
 * Example: /search/autocomplete?term=191&limit=10
 */
router.get('/autocomplete',
  validateLimit,
  asyncHandler(async (req, res) => {
    const { term, limit = 10 } = req.query;

    if (!term || term.trim().length < 2) {
      return res.status(400).json(ResponseUtils.formatError(
        'INVALID_INPUT',
        'Search term must be at least 2 characters long',
        400
      ));
    }

    logger.info('Fetching autocomplete suggestions', { term, limit });

    // Use controller for business logic
    const response = await SearchController.getAutocompleteSuggestions(term.trim(), parseInt(limit));

    logger.info('Autocomplete suggestions retrieved successfully', { 
      term,
      count: response.data?.suggestions?.length || 0
    });

    res.json(response);
  })
);

/**
 * GET /search/zipcode-summaries
 * Get ZIP code summaries with comprehensive data and multiple filters
 * Example: /search/zipcode-summaries?state=PA&city=Philadelphia&minPrice=200000&maxPrice=500000&limit=50
 */
router.get('/zipcode-summaries',
  validateZipcodeSummaries,
  asyncHandler(async (req, res) => {
    const { 
      state, 
      city, 
      minPrice, 
      maxPrice, 
      limit = 50,
      healthMeasure,
      maxHealthRatio,
      minIncome,
      maxIncome,
      minPoliceDepts,
      minPoliceOfficers,
      minHospitals,
      minFireStations,
      minFirefighters,
      minChildcare,
      minPopulation,
      maxPopulation
    } = req.query;

    logger.info('Fetching ZIP code summaries', { 
      state, 
      city, 
      minPrice, 
      maxPrice, 
      limit 
    });

    // Use controller for business logic
    const response = await SearchController.searchZipcodeSummaries({
      state,
      city,
      minPrice: minPrice ? parseInt(minPrice) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice) : 999999999,
      limit: parseInt(limit),
      healthMeasure: healthMeasure || "Obesity among adults",
      maxHealthRatio: maxHealthRatio ? parseFloat(maxHealthRatio) : 1,
      minIncome: minIncome ? parseInt(minIncome) : 0,
      maxIncome: maxIncome ? parseInt(maxIncome) : 999999999,
      minPoliceDepts: minPoliceDepts ? parseInt(minPoliceDepts) : 0,
      minPoliceOfficers: minPoliceOfficers ? parseInt(minPoliceOfficers) : 0,
      minHospitals: minHospitals ? parseInt(minHospitals) : 0,
      minFireStations: minFireStations ? parseInt(minFireStations) : 0,
      minFirefighters: minFirefighters ? parseInt(minFirefighters) : 0,
      minChildcare: minChildcare ? parseInt(minChildcare) : 0,
      minPopulation: minPopulation ? parseInt(minPopulation) : 0,
      maxPopulation: maxPopulation ? parseInt(maxPopulation) : 999999999
    });

    logger.info('ZIP code summaries retrieved successfully', { 
      count: response.data?.zipcodes?.length || 0,
      filters: { state, city, minPrice, maxPrice }
    });

    res.json(response);
  })
);

/**
 * GET /search/zipcodes
 * Get ZIP codes by city and state
 * Example: /search/zipcodes?city=Philadelphia&state=PA
 */
router.get('/zipcodes',
  validateStateQuery,
  asyncHandler(async (req, res) => {
    const { city, state } = req.query;

    if (!city || !state) {
      return res.status(400).json(ResponseUtils.formatError(
        'MISSING_PARAMETERS',
        'Both city and state parameters are required',
        400
      ));
    }

    logger.info('Fetching ZIP codes by city and state', { city, state });

    // Use controller for business logic
    const response = await SearchController.getZipcodesByCityState(city, state);

    logger.info('ZIP codes retrieved successfully', { 
      city,
      state,
      count: response.data?.zipcodes?.length || 0
    });

    res.json(response);
  })
);

/**
 * GET /search/cities
 * Get cities by state
 * Example: /search/cities?state=PA&limit=20
 */
router.get('/cities',
  validateStateQuery,
  validateLimit,
  asyncHandler(async (req, res) => {
    const { state, limit = 20 } = req.query;

    if (!state) {
      return res.status(400).json(ResponseUtils.formatError(
        'MISSING_PARAMETERS',
        'State parameter is required',
        400
      ));
    }

    logger.info('Fetching cities by state', { state, limit });

    // Use controller for business logic
    const response = await SearchController.getCitiesByState(state, parseInt(limit));

    logger.info('Cities retrieved successfully', { 
      state,
      count: response.data?.cities?.length || 0
    });

    res.json(response);
  })
);

/**
 * GET /search/states
 * Get all states
 * Example: /search/states
 */
router.get('/states',
  asyncHandler(async (req, res) => {
    logger.info('Fetching all states');

    // Use controller for business logic
    const response = await SearchController.getAllStates();

    logger.info('States retrieved successfully', { 
      count: response.data?.states?.length || 0
    });

    res.json(response);
  })
);

module.exports = router; 