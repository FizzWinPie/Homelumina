/**
 * Health Mock Class
 * Handles health-related database queries
 */

const BaseMock = require('./BaseMock');
const { mockHealthData } = require('../../fixtures/mockData');
const { logger } = require('../../../utils/logger');

class HealthMock extends BaseMock {
  constructor() {
    super();
    this.returnEmptyTables = false; // Default to false
  }

  /**
   * Handle health queries
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleQuery(queryLower, params) {
    // Health check queries
    if (this.isHealthCheckQuery(queryLower)) {
      return this.handleHealthCheckQuery();
    }

    // Table listing queries
    if (this.isTableListingQuery(queryLower)) {
      return this.handleTableListingQuery();
    }

    // Sample data queries
    if (this.isSampleDataQuery(queryLower)) {
      return this.handleSampleDataQuery(queryLower, params);
    }

    // Community health queries
    if (queryLower.includes('community') && queryLower.includes('health')) {
      return this.handleCommunityHealthQuery(params);
    }

    // Health statistics queries
    if (queryLower.includes('health') && queryLower.includes('statistics')) {
      return this.handleHealthStatisticsQuery(params);
    }

    // Default health response
    return this.createSuccessResponse(mockHealthData.default || []);
  }

  /**
   * Check if query is health check
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if health check query
   */
  isHealthCheckQuery(queryLower) {
    return queryLower.includes('select now()') || queryLower.includes('select current_timestamp');
  }

  /**
   * Handle health check query
   * @returns {Promise} Query response
   */
  handleHealthCheckQuery() {
    return this.createSuccessResponse([
      { current_timestamp: new Date() }
    ]);
  }

  /**
   * Check if query is table listing
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if table listing query
   */
  isTableListingQuery(queryLower) {
    return queryLower.includes('information_schema.tables') || queryLower.includes('pg_tables');
  }

  /**
   * Check if query is sample data query
   * @param {string} queryLower - Lowercase query string
   * @returns {boolean} True if sample data query
   */
  isSampleDataQuery(queryLower) {
    return queryLower.includes('select * from') && queryLower.includes('limit');
  }

  /**
   * Handle sample data query
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleSampleDataQuery(queryLower, params) {
    // Check for test mock first
    const tableName = this.extractTableName(queryLower);
    if (!tableName) {
      return this.createSuccessResponse([]);
    }

    // Use test mock if present - this should take priority over fallback data
    let testMock = this.getTestMock(tableName);
    if (testMock === undefined) {
      testMock = this.getTestMock(`from ${tableName}`);
    }
    if (testMock !== undefined) { // Accept empty array as valid
      let rows = testMock;
      // Convert object with numeric keys to array if needed
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      // Apply limit if specified in params
      const limit = params && params[0] ? parseInt(params[0]) : (rows ? rows.length : 0);
      const limitedRows = rows ? rows.slice(0, limit) : [];
      return this.createSuccessResponse(limitedRows);
    }

    // Fallback to sample data from mockHealthData
    const sampleData = mockHealthData.sampleData[tableName];
    if (sampleData) {
      // Apply limit if specified in params
      const limit = params && params[0] ? parseInt(params[0]) : sampleData.length;
      const limitedData = sampleData.slice(0, limit);
      return this.createSuccessResponse(limitedData);
    }

    // Return empty array if no data found
    return this.createSuccessResponse([]);
  }

  /**
   * Extract table name from query
   * @param {string} queryLower - Lowercase query string
   * @returns {string|null} Table name or null
   */
  extractTableName(queryLower) {
    // Match patterns like "select * from tablename" or "select * from tablename limit"
    const match = queryLower.match(/select \* from (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Handle community health query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleCommunityHealthQuery(params) {
    return this.createSuccessResponse(mockHealthData.community || [
      {
        zipcode: '19104',
        health_score: 85,
        hospital_count: 3,
        doctor_count: 25,
        life_expectancy: 78.5
      }
    ]);
  }

  /**
   * Handle health statistics query
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleHealthStatisticsQuery(params) {
    return this.createSuccessResponse(mockHealthData.statistics || [
      {
        zipcode: '19104',
        avg_health_score: 82.5,
        total_hospitals: 5,
        total_doctors: 45,
        avg_life_expectancy: 77.2
      }
    ]);
  }

  /**
   * Handle table listing query
   * @returns {Promise} Query response
   */
  handleTableListingQuery() {
    // Check if we should return empty array (for test that expects 0 tables)
    if (this.shouldReturnEmptyTables()) {
      return this.createSuccessResponse([]);
    }

    return this.createSuccessResponse(
      mockHealthData.tables.map(table => ({ 
        tablename: table,
        table_name: table
      }))
    );
  }

  /**
   * Check if we should return empty tables (for testing)
   * @returns {boolean} True if should return empty tables
   */
  shouldReturnEmptyTables() {
    // This can be controlled by setting a flag in the mock
    return this.returnEmptyTables || false;
  }

  /**
   * Set flag to return empty tables (for testing)
   * @param {boolean} empty - Whether to return empty tables
   */
  setReturnEmptyTables(empty) {
    this.returnEmptyTables = empty;
  }
}

module.exports = HealthMock; 