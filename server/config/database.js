const { Pool } = require('pg');
const { logger } = require('../utils/logger');
require('dotenv').config();

// Validate required environment variables (skip validation in test environment)
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Skip validation in test environment to allow mocking
if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  logger.error('Missing required environment variables:', { missingVars });
  logger.error('Please create a .env file with the following variables:', {
    requiredVars: [
      'DB_HOST=your-database-host',
      'DB_PORT=5432',
      'DB_NAME=your-database-name',
      'DB_USER=your-database-user',
      'DB_PASSWORD=your-database-password'
    ]
  });
  process.exit(1);
}

// Use test configuration if in test environment and no real database config is provided
const dbConfig = process.env.NODE_ENV === 'test' && missingVars.length > 0 ? {
  host: 'localhost',
  port: 5432,
  database: 'test_db',
  user: 'test_user',
  password: 'test_password',
  ssl: false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 1000,
  application_name: 'cis-5500-group-7-test',
  statement_timeout: 10000,
  query_timeout: 10000
} : {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Set to false for development, true for production
  },
  // Pool settings
  max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONN_TIMEOUT) || 2000, // Return an error after 2 seconds if connection could not be established
  // Additional security settings
  application_name: 'cis-5500-group-7-server',
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000, // Cancel queries that take longer than 30 seconds
  query_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000
};

const pool = new Pool(dbConfig);

// Test the connection
pool.on('connect', (client) => {
  logger.info('Connected to PostgreSQL database');
  // Set session-level security settings using env vars
  client.query(`SET SESSION statement_timeout = ${process.env.DB_STATEMENT_TIMEOUT || 30000}`);
  client.query(`SET SESSION lock_timeout = ${process.env.DB_LOCK_TIMEOUT || 10000}`);
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message, stack: err.stack });
  // Don't exit the process, just log the error
  // The pool will handle reconnection automatically
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down database pool...');
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down database pool...');
  pool.end();
  process.exit(0);
});

module.exports = pool; 