const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ResponseUtils = require('../utils/responseUtils');
const { isValidLimit, isValidTableName } = require('../utils/validationUtils');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middlewareLib/errorHandler');
const { validateZipcode } = require('../middlewareLib/validation/validationExports');

// Import health controller for health data endpoints
const HealthController = require('../controllers/healthController');

// Health status endpoint (for tests)
router.get('/status', (req, res) => {
  const healthData = {
    status: 'healthy',
    version: '3.0.0',
    server: {
      name: 'CIS 5500 Group 7 API',
      environment: process.env.NODE_ENV || 'development'
    }
  };
  
  res.json(ResponseUtils.formatSuccess(healthData));
});

// Database health check endpoint (for tests)
router.get('/database', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    const healthData = {
      status: 'connected',
      databaseTime: result.rows[0].now
    };
    
    res.json(ResponseUtils.formatSuccess(healthData));
  } catch (err) {
    logger.error('Database connection error:', { error: err.message, stack: err.stack });
    
    res.status(500).json(ResponseUtils.formatError(
      'Connection refused',
      500,
      req.originalUrl,
      err.message
    ));
  }
});

// Memory usage endpoint (for tests)
router.get('/memory', (req, res) => {
  const memUsage = process.memoryUsage();
  const memoryData = {
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external
  };
  
  res.json(ResponseUtils.formatSuccess(memoryData));
});

// List all tables
router.get('/tables', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    client.release();
    
    const tables = result.rows.map(row => row.table_name);
    res.json(ResponseUtils.formatTableResponse(tables));
  } catch (err) {
    logger.error('Error fetching tables:', { error: err.message, stack: err.stack });
    res.status(500).json(ResponseUtils.formatError(
      'Database connection failed',
      500,
      req.originalUrl,
      err.message
    ));
  }
});

// Check table structure
router.get('/table-structure/:tableName', async (req, res) => {
  try {
    const client = await pool.connect();
    const tableName = req.params.tableName;
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `, [tableName]);
    client.release();
    
    const structureData = {
      table: tableName,
      columns: result.rows
    };
    
    res.json(ResponseUtils.formatSuccess(structureData));
  } catch (err) {
    logger.error('Error fetching table structure:', { error: err.message, stack: err.stack });
    res.status(500).json(ResponseUtils.formatError(
      'Failed to fetch table structure',
      500,
      req.originalUrl,
      err.message
    ));
  }
});

// Get sample data from any table
router.get('/sample-data/:tableName', async (req, res) => {
  try {
    const client = await pool.connect();
    const tableName = req.params.tableName;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate table name to prevent SQL injection
    const validTables = [
      'childcarecenters', 'hospitals', 'policestations', 'firefighterstations',
      'zipcode', 'localmarket', 'healthmeasure', 'householdincome'
    ];
    
    if (!isValidTableName(tableName, validTables)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Invalid table name',
        400,
        req.originalUrl,
        { validTables }
      ));
    }
    
    // Validate limit parameter format and range
    if (req.query.limit && !isValidLimit(req.query.limit)) {
      return res.status(400).json(ResponseUtils.formatError(
        'Limit must be a positive number between 1 and 100',
        400,
        req.originalUrl
      ));
    }
    
    const result = await client.query(`
      SELECT * FROM ${tableName} 
      LIMIT $1;
    `, [limit]);
    client.release();
    
    res.json(ResponseUtils.formatSampleDataResponse(result.rows, tableName, limit));
  } catch (err) {
    logger.error('Error fetching sample data:', { error: err.message, stack: err.stack });
    res.status(500).json(ResponseUtils.formatError(
      'Table does not exist',
      500,
      req.originalUrl,
      err.message
    ));
  }
});

// Handle missing table parameter for sample-data endpoint
router.get('/sample-data/', (req, res) => {
  res.status(404).json(ResponseUtils.formatNotFound('Route', req.originalUrl));
});

/**
 * GET /api/v1/health/measures
 * Returns all available health measures for dropdown filter
 */
router.get('/measures', async (req, res) => {
  try {
    logger.info('Fetching available health measures for dropdown');
    const response = await HealthController.getAvailableHealthMeasures();
    logger.info('Available health measures retrieved successfully', { 
      count: response.data?.measures?.length 
    });
    res.json(response);
  } catch (error) {
    logger.error('Error fetching available health measures:', { error: error.message });
    res.status(500).json(ResponseUtils.formatError(
      'Failed to fetch available health measures',
      500,
      req.originalUrl,
      error.message
    ));
  }
});

/**
 * GET /health/measure-trends
 * Returns health measure trends for a specific measure and zipcode
 * Query params: measure (required), zipcode (required)
 */
router.get('/measure-trends', asyncHandler(async (req, res) => {
  const { measure, zipcode } = req.query;
  if (!measure || !zipcode) {
    return res.status(400).json(ResponseUtils.formatError(
      'Missing required query parameters: measure and zipcode',
      400,
      req.originalUrl
    ));
  }
  logger.info('Fetching health measure trends', { measure, zipcode });
  const response = await HealthController.getHealthMeasureTrends(zipcode, measure);
  logger.info('Health measure trends retrieved successfully', { measure, zipcode });
  res.json(response);
}));

/**
 * GET /health/measures-by-city/:city/:state
 * Returns health measures for a specific city and state
 * Path params: city (required), state (required)
 * Query param: limit (optional)
 */
router.get('/measures-by-city/:city/:state', asyncHandler(HealthController.getHealthMeasuresByCity));

/**
 * GET /health/measures-by-zipcode/:zipcode
 * Returns health measures for a specific ZIP code
 */
router.get('/measures-by-zipcode/:zipcode',
  validateZipcode,
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;
    logger.info('Fetching health measures by zipcode', { zipcode });
    const response = await HealthController.getHealthMeasuresByZipcode(zipcode);
    logger.info('Health measures by zipcode retrieved successfully', { zipcode });
    res.json(response);
  })
);

/**
 * GET /health/validate-zipcode
 * Validates if a zipcode exists in the healthmeasure table
 * Query param: zipcode (required)
 */
router.get('/validate-zipcode', asyncHandler(async (req, res) => {
  const { zipcode } = req.query;
  if (!zipcode) {
    return res.status(400).json(ResponseUtils.formatError(
      'Missing required query parameter: zipcode',
      400,
      req.originalUrl
    ));
  }
  logger.info('Validating health zipcode', { zipcode });
  const response = await HealthController.validateZipcode(zipcode);
  logger.info('Health zipcode validation completed', { zipcode });
  res.json(response);
}));

/**
 * GET /health/community/:zipcode
 * Returns community health properties (asthma, obesity, social isolation etc.) 
 * along with hospital metrics for a specific ZIP code
 * Can be reused for location and comparison pages
 */
router.get('/community/:zipcode',
  validateZipcode,        // Validate ZIP code format
  asyncHandler(async (req, res) => {
    const { zipcode } = req.params;

    logger.info('Fetching community health properties by ZIP code', { zipcode });

    // Use controller for business logic
    const result = await HealthController.getCommunityHealthProperties(zipcode);

    logger.info('Community health properties retrieved successfully', { 
      zipcode,
      hasData: !!result.data 
    });

    res.json(result);
  })
);

module.exports = router; 