/**
 * Logging Utility
 * Uses Winston for structured logging with proper levels and formatting
 */

const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'cis-5500-api',
    version: '3.0.0'
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    })
  ]
});

// Request logger middleware
const requestLogger = (req, res, next) => {
  // Skip logging for static files to avoid conflicts
  if (req.url.includes('/swagger-ui.') || req.url.includes('.css') || req.url.includes('.js') || req.url.includes('.png') || req.url.includes('.ico')) {
    return next();
  }

  // Generate request ID
  req.requestId = uuidv4();
  
  // Create child logger for this request
  req.logger = logger.child({ 
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  const start = process.hrtime.bigint();

  // Log request start
  req.logger.http('Request started', {
    query: sanitizeData(req.query),
    params: req.params,
    body: req.method !== 'GET' ? sanitizeData(req.body) : undefined
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Number(process.hrtime.bigint() - start) / 1000000;
    
    req.logger.http('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: res.get('Content-Length') || chunk?.length || 0
    });

    // Log slow requests as warnings
    if (duration > 1000) {
      req.logger.warn('Slow request detected', {
        duration: `${duration.toFixed(2)}ms`,
        url: req.url
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logger middleware
const errorLogger = (error, req, res, next) => {
  const logger = req.logger || winston;
  
  logger.error('Request error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      query: sanitizeData(req.query),
      params: req.params,
      body: sanitizeData(req.body)
    }
  });

  next(error);
};

// Database query logger
const logDatabaseQuery = (query, params, duration, requestId = null) => {
  const logData = {
    query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
    params: sanitizeData(params),
    duration: `${duration}ms`
  };

  if (requestId) {
    logData.requestId = requestId;
  }

  if (duration > 1000) {
    logger.warn('Slow database query', logData);
  } else {
    logger.debug('Database query executed', logData);
  }
};

// Performance monitor
const performanceMonitor = (req, res, next) => {
  // Skip monitoring for static files to avoid conflicts
  if (req.url.includes('/swagger-ui.') || req.url.includes('.css') || req.url.includes('.js') || req.url.includes('.png') || req.url.includes('.ico')) {
    return next();
  }

  const start = process.hrtime.bigint();
  
  // Override res.end to set response time header
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Number(process.hrtime.bigint() - start) / 1000000;
    
    // Set the response time header before sending the response
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    const metrics = {
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      url: req.url,
      method: req.method
    };

    if (req.requestId) {
      metrics.requestId = req.requestId;
    }

    logger.debug('Performance metrics', metrics);
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Sanitize sensitive data
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitive = ['password', 'token', 'ssn', 'credit_card', 'api_key', 'secret'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
};

// Health check logger
const healthCheckLogger = (req, res, next) => {
  if (req.url === '/health' || req.url === '/health/') {
    logger.info('Health check requested', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress
    });
  }
  next();
};

// API usage logger
const logApiUsage = (req, res) => {
  const usage = {
    timestamp: new Date().toISOString(),
    endpoint: `${req.method} ${req.url}`,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };

  if (req.requestId) {
    usage.requestId = req.requestId;
  }

  logger.info('API usage', usage);
};

// Export logger and middleware
module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceMonitor,
  logDatabaseQuery,
  logApiUsage,
  healthCheckLogger,
  sanitizeData
}; 