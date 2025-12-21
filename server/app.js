const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const ResponseUtils = require('./utils/responseUtils');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Generate Swagger spec
const swaggerOptions = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "CIS 5500 Project - Group 7",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Import middleware
const { 
  errorHandler, 
  notFoundHandler
} = require('./middlewareLib/errorHandler');
const { 
  requestLogger, 
  performanceMonitor, 
  healthCheckLogger,
  logger 
} = require('./utils/logger');
const { validateRequest } = require('./middlewareLib/validation/validationExports');
const {
  versionDetection,
  versionValidation,
  getVersionInfo
} = require('./middlewareLib/versioning');

// Import enhanced routes
const facilitiesRoutes = require('./routes/facilitiesRoutes');
const realEstateRoutes = require('./routes/realEstateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const createApp = () => {
  const app = express();

  // Apply middleware in order
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Request logging and performance monitoring
  app.use(requestLogger);
  app.use(performanceMonitor);

  // API versioning middleware
  app.use(versionDetection);
  app.use(versionValidation);

  // Input validation and sanitization
  app.use(validateRequest);

  // Serve Swagger UI at /swagger
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Root endpoint with API information
  app.get('/', (req, res) => {
    const endpoints = {
      v1: '/api/v1/*',
      health: '/health'
    };
    
    res.json(ResponseUtils.formatApiInfo('CIS 5500 Group 7 API', '3.0.0', endpoints));
  });

  // Health check endpoint (no versioning needed)
  app.get('/health', healthCheckLogger, (req, res) => {
    res.json(ResponseUtils.formatHealthCheck('main-api', 'healthy', { version: '3.0.0' }));
  });

  // API Version 1 Routes
  app.use('/api/v1/facilities', facilitiesRoutes);
  app.use('/api/v1/real-estate', realEstateRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/admin', adminRoutes);
  
  // API version information endpoint
  app.get('/api/versions', getVersionInfo);

  // API Documentation endpoint
  app.get('/api/v1/docs', (req, res) => {
    res.json({
      version: '1.0.0',
      title: 'CIS 5500 Group 7 API Documentation',
      description: 'API for city facilities, real estate, and analytics data',
      baseUrl: '/api/v1',
      endpoints: {
        facilities: {
          base: '/facilities',
          endpoints: [
            'GET /top?zipcode=19104&limit=5 - Get top facilities by ZIP code',
            'GET /childcare?city=Philadelphia&limit=10 - Get childcare facilities by city',
            'GET /validate?zipcode=19104 - Validate ZIP code format',
            'GET /search?zipcode=19104&city=Philadelphia&type=childcare&limit=10 - Search facilities with filters',
            'GET /count?zipcode=19104 - Get facilities count by type'
          ]
        },
        realestate: {
          base: '/real-estate',
          endpoints: [
            'GET /lowest-prices - Get lowest priced properties',
            'GET /highest-prices - Get highest priced properties',
            'GET /average-prices - Get average property prices',
            'GET /compare-zipcodes?zipcode1=19104&zipcode2=19102 - Compare home prices between ZIP codes',
            'GET /affordable?maxPrice=300000&limit=10 - Get affordable housing options',
            'GET /search?zipcode=19104&limit=5 - Search properties by ZIP code',
            'GET /statistics/19104 - Get home price statistics for ZIP code',
            'GET /prices/zipcode-range?minZipcode=19100&maxZipcode=19200 - Get prices by ZIP code range',
            'GET /price-trends/:zipcode - Get market trends over time (median listing price and month date) for chart components'
          ]
        },
        analytics: {
          base: '/analytics',
          endpoints: [
            'GET /underserved-zipcodes - Get underserved ZIP codes',
            'GET /safety-sale-ratio - Get safety to sale ratio analysis',
            'GET /homepage-featured-zipcodes?limit=4 - Get homepage featured ZIP codes with population >= 2000 and good social service/healthcare resources',
            'GET /location/:zipcode - Get comprehensive location page data for a specific ZIP code (population, real estate, income, facilities)'
          ]
        },
        health: {
          base: '/health',
          endpoints: [
            'GET / - Basic health check',
            'GET /tables - List database tables',
            'GET /sample-data/:table - Get sample data from table'
          ]
        },
        search: {
          base: '/search',
          endpoints: [
            'GET /featured-cities?limit=3 - Get featured cities based on affordability and health metrics',
            'GET /autocomplete?term=191&limit=10 - Get autocomplete suggestions for ZIP codes, cities, and states',
            'GET /zipcode-summaries?state=PA&city=Philadelphia&minPrice=200000&maxPrice=500000&limit=50 - Search ZIP codes with comprehensive summary data and multiple filters',
            'GET /zipcodes?city=Philadelphia&state=PA - Get ZIP codes by city and state',
            'GET /cities?state=PA&limit=20 - Get cities by state',
            'GET /states - Get all states'
          ]
        }
      },
      parameters: {
        limit: 'Number of results to return (default: 10, max: 100)',
        zipcode: '5-digit ZIP code',
        city: 'City name',
        facilityType: 'Type of facility (childcare, hospital, police, firefighter)'
      },
      responses: {
        success: '200 OK with JSON data',
        validation: '400 Bad Request with error details',
        notFound: '404 Not Found',
        serverError: '500 Internal Server Error'
      }
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// Create the app instance
const app = createApp();

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (pool) {
      logger.info('Shutting down database pool...');
      await pool.end();
    }
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  app.listen(PORT, () => {
    const HOST = process.env.HOST || 'localhost';
    const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    logger.info(`Server is running on ${PROTOCOL}://${HOST}:${PORT}`);
    logger.info(`API Version 1: ${PROTOCOL}://${HOST}:${PORT}/api/v1`);
    logger.info(`Documentation: ${PROTOCOL}://${HOST}:${PORT}/api/v1/docs`);
    logger.info(`Health Check: ${PROTOCOL}://${HOST}:${PORT}/health`);
    logger.info('Features enabled:', {
      features: [
        'API versioning (v1)',
        'Enhanced error handling',
        'Request validation and sanitization',
        'Performance monitoring',
        'Comprehensive logging'
      ]
    });
  });
}

const fs = require("fs");
fs.writeFileSync("./swagger.json", JSON.stringify(swaggerSpec, null, 2));

module.exports = app;
