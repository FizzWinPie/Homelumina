/**
 * Facilities Mock Class
 * Handles facilities-related database queries
 */

const BaseMock = require('./BaseMock');
let mockFacilitiesData = require('../../fixtures/mockData').mockFacilitiesData;
const { logger } = require('../../../utils/logger');

// Allow passing custom mock data for integration tests
function createFacilitiesMock(customMockData) {
  return new FacilitiesMock(customMockData);
}

class FacilitiesMock extends BaseMock {
  constructor(customMockData) {
    super();
    this._customMockData = customMockData;
  }
  get facilitiesData() {
    if (this._customMockData && this._customMockData.mockFacilitiesData) {
      return this._customMockData.mockFacilitiesData;
    }
    return require('../../fixtures/mockData').mockFacilitiesData;
  }

  /**
   * Handle facilities queries
   * @param {string} query - SQL query
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleQuery(query, queryLower, params) {
    const { logger } = require('../../../../server/utils/logger');
    logger.debug(`[FacilitiesMock] handleQuery called`, { queryLower, params });

    // Always check for test mock for param key first
    if (params && params.length) {
      const paramKey = params.map(String).join(',');
      let paramTestMock = this.getTestMock(paramKey);
      if (paramTestMock !== undefined) {
        if (paramTestMock && typeof paramTestMock === 'object' && !Array.isArray(paramTestMock)) {
          const numericKeys = Object.keys(paramTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            paramTestMock = numericKeys.map(k => paramTestMock[k]);
          }
        }
        logger.debug(`[FacilitiesMock] Returning paramKey test mock`, { paramKey, value: paramTestMock });
        return this.createSuccessResponse(paramTestMock);
      }
    }

    // Parameter-based lookups for childcare queries (PRIORITY)
    if (queryLower.includes('childcarecenters') && params && params.length >= 2) {
      const paramKey = params.map(String).join(',');
      let paramTestMock = this.getTestMock(paramKey);
      if (paramTestMock === undefined) {
        paramTestMock = this.getTestMock('childcarecenters');
      }
      if (paramTestMock !== undefined) {
        // Convert object with numeric keys to array
        if (paramTestMock && typeof paramTestMock === 'object' && !Array.isArray(paramTestMock)) {
          const numericKeys = Object.keys(paramTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            paramTestMock = numericKeys.map(k => paramTestMock[k]);
          }
        }
        logger.debug(`[FacilitiesMock] Returning childcare param/childcarecenters mock`, { paramKey, value: paramTestMock });
        return this.createSuccessResponse(paramTestMock);
      }
      // Fallback to 'JOIN' key
      paramTestMock = this.getTestMock('JOIN');
      if (paramTestMock !== undefined) {
        if (paramTestMock && typeof paramTestMock === 'object' && !Array.isArray(paramTestMock)) {
          const numericKeys = Object.keys(paramTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            paramTestMock = numericKeys.map(k => paramTestMock[k]);
          }
        }
        logger.debug(`[FacilitiesMock] Returning childcare JOIN fallback mock`, { value: paramTestMock });
        return this.createSuccessResponse(paramTestMock);
      }
      // Check for 'UNION' test mock before falling back to default
      const unionTestMock = this.getTestMock('UNION');
      if (unionTestMock !== undefined) {
        let rows = unionTestMock;
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
          rows = numericKeys.map(k => rows[k]);
        }
        logger.debug(`[FacilitiesMock] Returning UNION test mock for childcare query`, { value: rows });
        return this.createSuccessResponse(rows);
      }
      // Fallback to default mock data
      logger.debug(`[FacilitiesMock] Returning childcare default mock`);
      // If this is a zipcode summary query, ensure state property is present
      if (queryLower.includes('zipcodesincityorstate') || queryLower.includes('zipcodes in city or state')) {
        return this.createSuccessResponse([{
          zipcode: '19104',
          city: 'Philadelphia',
          state: 'PA',
          latitude: 39.9526,
          longitude: -75.1652,
          population: 25000,
          medianprice: 350000,
          meanincome: 45000,
          healthratio: 0.15,
          policedepartmentscount: 2,
          numpoliceofficerscount: 25,
          hospitalscount: 3,
          firestationscount: 1,
          firefighterscount: 15,
          childcarecenterscount: 5
        }]);
      }
      return this.createSuccessResponse(this.facilitiesData);
    }

    // Top/count queries: check param key and 'UNION'
    if (params && params.length >= 2) {
      const paramKey = params.map(String).join(',');
      let paramTestMock = this.getTestMock(paramKey);
      if (paramTestMock === undefined) {
        paramTestMock = this.getTestMock('UNION');
      }
      if (paramTestMock !== undefined) {
        if (paramTestMock && typeof paramTestMock === 'object' && !Array.isArray(paramTestMock)) {
          const numericKeys = Object.keys(paramTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            paramTestMock = numericKeys.map(k => paramTestMock[k]);
          }
        }
        logger.debug(`[FacilitiesMock] Returning top/count param/UNION mock`, { paramKey, value: paramTestMock });
        return this.createSuccessResponse(paramTestMock);
      }
      // Fallback to default mock data
      return this.createSuccessResponse(this.facilitiesData);
    }
    
    // Always check for 'UNION' test mock for top/count queries (even without params)
    if (queryLower.includes('union all') || queryLower.includes('facility_id')) {
      const unionTestMock = this.getTestMock('UNION');
      if (unionTestMock !== undefined) {
        let rows = unionTestMock;
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
          rows = numericKeys.map(k => rows[k]);
        }
        logger.debug(`[FacilitiesMock] Returning UNION test mock for top facilities query`, { value: rows });
        return this.createSuccessResponse(rows);
      }
    }
    // Always check for 'UNION' test mock for top/count queries
    const unionFallbackMock = this.getTestMock('UNION');
    if (unionFallbackMock !== undefined) {
      let rows = unionFallbackMock;
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      logger.debug(`[FacilitiesMock] Returning UNION fallback mock`, { value: rows });
      return this.createSuccessResponse(rows);
    }
    // Zipcode summary queries (PRIORITY)
    if (queryLower.includes('zipcodesincityorstate') || queryLower.includes('zipcodes in city or state')) {
      let zipSummaryTestMock = this.getTestMock('zipcodesincityorstate');
      if (zipSummaryTestMock === undefined) {
        zipSummaryTestMock = this.getTestMock('ZipCodesInCityOrState AS');
      }
      if (zipSummaryTestMock !== undefined) {
        let rows = zipSummaryTestMock;
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
          rows = numericKeys.map(k => rows[k]);
        }
        // Always return at least one row for this test
        if (!rows || rows.length === 0) {
          rows = [{
            zipcode: '19104',
            city: 'Philadelphia',
            state: 'PA',
            latitude: 39.9526,
            longitude: -75.1652,
            population: 25000,
            medianprice: 350000,
            meanincome: 45000,
            healthratio: 0.15,
            policedepartmentscount: 2,
            numpoliceofficerscount: 25,
            hospitalscount: 3,
            firestationscount: 1,
            firefighterscount: 15,
            childcarecenterscount: 5
          }];
        } else {
          // Ensure every row has a 'state' property
          rows = rows.map(row => ({ ...row, state: row.state || 'PA' }));
        }
        logger.debug(`[FacilitiesMock] Returning zipcode summary mock`, { value: rows });
        // Final zipcode summary rows processed
        return this.createSuccessResponse(rows);
      }
      // Fallback to default zipcode summary data
      logger.debug(`[FacilitiesMock] Returning zipcode summary default mock`);
      return this.createSuccessResponse([{
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        latitude: 39.9526,
        longitude: -75.1652,
        population: 25000,
        medianprice: 350000,
        meanincome: 45000,
        healthratio: 0.15,
        policedepartmentscount: 2,
        numpoliceofficerscount: 25,
        hospitalscount: 3,
        firestationscount: 1,
        firefighterscount: 15,
        childcarecenterscount: 5
      }]);
    }

    // Validate-zipcode lookup (PRIORITY)
    if (queryLower.includes('validate-zipcode') || queryLower.includes('count(*) as count')) {
      let validateTestMock = this.getTestMock('validate-zipcode');
      if (validateTestMock !== undefined) {
        if (validateTestMock && typeof validateTestMock === 'object' && !Array.isArray(validateTestMock)) {
          const numericKeys = Object.keys(validateTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            validateTestMock = numericKeys.map(k => validateTestMock[k]);
          }
        }
        logger.debug(`[FacilitiesMock] Returning validate-zipcode mock`, { value: validateTestMock });
        return this.createSuccessResponse(validateTestMock);
      }
      // Fallback: always return [{ count: 5 }]
      logger.debug(`[FacilitiesMock] Returning validate-zipcode default mock`);
      return this.createSuccessResponse([{ count: 5 }]);
    }

    // Check for test mocks first
    const testMock = this.getTestMock(queryLower);
    if (testMock !== undefined) {
      let rows = testMock;
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      return this.createSuccessResponse(rows);
    }

    // Check for 'UNION' test mock (used for top facilities and count queries)
    const unionTestMock = this.getTestMock('UNION');
    if (unionTestMock !== undefined) {
      let rows = unionTestMock;
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      
      // Check if this is a count query (has 'type' and 'count' fields)
      if (rows && Array.isArray(rows) && rows.length > 0 && rows[0].type) {
        // This is a facilities count query - return as is
        return this.createSuccessResponse(rows);
      }
      
      // This is a top facilities query - ensure correct structure
      if (rows && Array.isArray(rows)) {
        rows = rows.map(row => ({
          facility_id: row.id || row.facility_id || 1,
          facility_type: row.facility_type || 'childcare',
          zipcode: row.zipcode || '19104',
          latitude: row.latitude || 39.9526,
          longitude: row.longitude || -75.1652
        }));
      }
      
      return this.createSuccessResponse(rows || []);
    }

    // Always check for 'UNION' test mock for top facilities queries (params: [zipcode, limit])
    if (params && params.length === 2 && typeof params[0] === 'string' && (typeof params[1] === 'number' || typeof params[1] === 'string')) {
      const unionMock = this.getTestMock('UNION');
      if (unionMock !== undefined) {
        let rows = unionMock;
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
          rows = numericKeys.map(k => rows[k]);
        }
        logger.debug(`[FacilitiesMock] Returning UNION mock for top facilities query`, { value: rows });
        return this.createSuccessResponse(rows);
      }
      // Fallback to default mock data
      return this.createSuccessResponse(this.facilitiesData);
    }

    // Handle UNION ALL queries for facilities count and top facilities
    if (queryLower.includes('union all') && (queryLower.includes('childcare') || queryLower.includes('hospital') || queryLower.includes('police') || queryLower.includes('firefighter'))) {
      // Always use 'UNION' test mock if set
      const unionMock = this.getTestMock('UNION');
      if (unionMock !== undefined) {
        let rows = unionMock;
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
          rows = numericKeys.map(k => rows[k]);
        }
        logger.debug(`[FacilitiesMock] Returning UNION mock for top/count query`, { value: rows });
        return this.createSuccessResponse(rows);
      }
      // Fallback to default mock data
      return this.createSuccessResponse([
        { type: 'childcare', count: '5' },
        { type: 'hospital', count: '3' },
        { type: 'police', count: '2' },
        { type: 'firefighter', count: '1' }
      ]);
    }

    // Handle specific facilities query patterns
    if (queryLower.includes('select * from facilities where zipcode = $1 order by rating desc limit $2')) {
      // Top facilities query - return mock data
      return this.createSuccessResponse(this.facilitiesData);
    }

    if (queryLower.includes('select * from facilities where city ilike $1')) {
      // Search facilities by city query
      return this.createSuccessResponse(this.facilitiesData);
    }

    if (queryLower.includes('select * from facilities where zipcode = $1 and city = $2')) {
      // Search facilities by zipcode and city query
      return this.createSuccessResponse(this.facilitiesData);
    }

    if (queryLower.includes('select * from facilities where zipcode = $1')) {
      // General facilities by zipcode query
      return this.createSuccessResponse(this.facilitiesData);
    }

    // Handle validate-zipcode query pattern
    if (queryLower.includes('validate-zipcode') || queryLower.includes('count(*) as count')) {
      let validateTestMock = this.getTestMock('validate-zipcode');
      if (validateTestMock !== undefined) {
        if (validateTestMock && typeof validateTestMock === 'object' && !Array.isArray(validateTestMock)) {
          const numericKeys = Object.keys(validateTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            validateTestMock = numericKeys.map(k => validateTestMock[k]);
          }
        }
        return this.createSuccessResponse(validateTestMock);
      }
      // Default response for validate-zipcode
      return this.createSuccessResponse([{ count: 5 }]);
    }

    // Handle JOIN queries (childcare by city)
    if (queryLower.includes('join') || queryLower.includes('childcarecenters')) {
      const joinTestMock = this.getTestMock('JOIN');
      if (joinTestMock !== undefined) {
        if (joinTestMock && typeof joinTestMock === 'object' && !Array.isArray(joinTestMock)) {
          const numericKeys = Object.keys(joinTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            joinTestMock = numericKeys.map(k => joinTestMock[k]);
          }
        }
        return this.createSuccessResponse(joinTestMock);
      }
      // Default response for JOIN queries
      return this.createSuccessResponse([
        {
          id: 1,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        },
        {
          id: 2,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        }
      ]);
    }

    // Handle specific query patterns for tests
    if (queryLower.includes('select * from facilities limit 1')) {
      // Database mock integration test
      let testMock = this.getTestMock(query);
      if (testMock === undefined) {
        testMock = this.getTestMock('SELECT * FROM facilities LIMIT 1');
      }
      if (testMock === undefined) {
        testMock = this.getTestMock('SELECT * FROM facilities');
      }
      if (testMock !== undefined) {
        return this.createSuccessResponse(testMock);
      }
      // Default response for facilities query
      return this.createSuccessResponse([
        { id: 1, name: 'Test Facility' }
      ]);
    }

    // Handle childcare by city specific query
    if (queryLower.includes('childcare') && queryLower.includes('city')) {
      const joinTestMock = this.getTestMock('JOIN');
      if (joinTestMock !== undefined) {
        if (joinTestMock && typeof joinTestMock === 'object' && !Array.isArray(joinTestMock)) {
          const numericKeys = Object.keys(joinTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            joinTestMock = numericKeys.map(k => joinTestMock[k]);
          }
        }
        return this.createSuccessResponse(joinTestMock);
      }
      // Default response for childcare by city
      return this.createSuccessResponse([
        {
          id: 1,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        },
        {
          id: 2,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        }
      ]);
    }

    // Handle childcarecenters table queries (childcare by city)
    if (queryLower.includes('childcarecenters') && queryLower.includes('join')) {
      const joinTestMock = this.getTestMock('JOIN');
      if (joinTestMock !== undefined) {
        if (joinTestMock && typeof joinTestMock === 'object' && !Array.isArray(joinTestMock)) {
          const numericKeys = Object.keys(joinTestMock).filter(k => !isNaN(Number(k)));
          if (numericKeys.length > 0) {
            joinTestMock = numericKeys.map(k => joinTestMock[k]);
          }
        }
        return this.createSuccessResponse(joinTestMock);
      }
      // Default response for childcarecenters JOIN query
      return this.createSuccessResponse([
        {
          id: 1,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        },
        {
          id: 2,
          zipcode: '19104',
          latitude: 39.9526,
          longitude: -75.1652,
          city: 'Philadelphia',
          state: 'PA'
        }
      ]);
    }

    // Check for zipcode summaries test mock (robust pattern)
    let zipSummaryTestMock = this.getTestMock('ZipCodesInCityOrState AS');
    if (zipSummaryTestMock === undefined) {
      zipSummaryTestMock = this.getTestMock('zipcodesincityorstate');
    }
    if (zipSummaryTestMock !== undefined) {
      let rows = zipSummaryTestMock;
      if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
        const numericKeys = Object.keys(rows).filter(k => !isNaN(Number(k)));
        rows = numericKeys.map(k => rows[k]);
      }
      // Always return at least one row for this test
      if (!rows || rows.length === 0) {
        rows = [{
          zipcode: '19104',
          city: 'Philadelphia',
          state: 'PA',
          latitude: 39.9526,
          longitude: -75.1652,
          population: 25000,
          medianprice: 350000,
          meanincome: 45000,
          healthratio: 0.15,
          policedepartmentscount: 2,
          numpoliceofficerscount: 25,
          hospitalscount: 3,
          firestationscount: 1,
          firefighterscount: 15,
          childcarecenterscount: 5
        }];
      } else {
        // Ensure every row has a 'state' property
        rows = rows.map(row => ({ ...row, state: row.state || 'PA' }));
      }
      return this.createSuccessResponse(rows);
    }

    // Default fallback for facilities queries
    return this.createSuccessResponse([]);
  }

  /**
   * Handle childcare queries
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleChildcareQuery(params) {
    return this.createSuccessResponse(this.facilitiesData.filter(f => f.type === 'childcare') || [
      {
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        type: 'childcare',
        name: 'Sunshine Daycare',
        rating: 4.5,
        address: '123 Main St'
      }
    ]);
  }

  /**
   * Handle hospital queries
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleHospitalQuery(params) {
    return this.createSuccessResponse(this.facilitiesData.filter(f => f.type === 'hospital') || [
      {
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        type: 'hospital',
        name: 'University Hospital',
        rating: 4.8,
        address: '456 Oak Ave'
      }
    ]);
  }

  /**
   * Handle police queries
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handlePoliceQuery(params) {
    return this.createSuccessResponse(this.facilitiesData.filter(f => f.type === 'police') || [
      {
        zipcode: '19104',
        city: 'Philadelphia',
        state: 'PA',
        type: 'police',
        name: 'Police Station #1',
        rating: 4.2,
        address: '789 Pine St'
      }
    ]);
  }

  /**
   * Handle top facilities query (migrated UNION query)
   * @param {Array} params - Query parameters [zipcode, limit]
   * @returns {Promise} Query response
   */
  handleTopFacilitiesQuery(params) {
    const zipcode = params[0] || '19104';
    const limit = params[1] || 10;
    
    // Create mock data that matches the expected structure from the migrated query
    const mockData = [
      {
        facility_id: 1,
        facility_type: 'childcare',
        zipcode: zipcode,
        latitude: 39.9526,
        longitude: -75.1652
      },
      {
        facility_id: 2,
        facility_type: 'hospital',
        zipcode: zipcode,
        latitude: 39.9526,
        longitude: -75.1652
      },
      {
        facility_id: 3,
        facility_type: 'police',
        zipcode: zipcode,
        latitude: 39.9526,
        longitude: -75.1652
      },
      {
        facility_id: 4,
        facility_type: 'firefighter',
        zipcode: zipcode,
        latitude: null,
        longitude: null
      }
    ];
    
    return this.createSuccessResponse(mockData.slice(0, limit));
  }

  /**
   * Handle validate zipcode query (migrated COUNT query)
   * @param {Array} params - Query parameters [zipcode]
   * @returns {Promise} Query response
   */
  handleValidateZipcodeQuery(params) {
    const zipcode = params[0] || '19104';
    
    // Mock response: assume zipcode has facilities
    const mockData = [
      {
        count: '3' // 3 facilities found
      }
    ];
    
    return this.createSuccessResponse(mockData);
  }

  /**
   * Handle facility stats query (migrated GROUP BY query)
   * @param {Array} params - Query parameters [zipcode]
   * @returns {Promise} Query response
   */
  handleFacilityStatsQuery(params) {
    const zipcode = params[0] || '19104';
    
    // Mock response with facility statistics
    const mockData = [
      {
        facility_type: 'childcare',
        count: '5',
        avg_rating: '4.2',
        min_rating: '3.5',
        max_rating: '5.0'
      },
      {
        facility_type: 'hospital',
        count: '3',
        avg_rating: '4.5',
        min_rating: '4.0',
        max_rating: '5.0'
      },
      {
        facility_type: 'police',
        count: '2',
        avg_rating: '4.0',
        min_rating: '3.8',
        max_rating: '4.2'
      },
      {
        facility_type: 'firefighter',
        count: '1',
        avg_rating: '4.8',
        min_rating: '4.8',
        max_rating: '4.8'
      }
    ];
    
    return this.createSuccessResponse(mockData);
  }

  /**
   * Handle facilities queries with WHERE clauses
   * @param {string} queryLower - Lowercase query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query response
   */
  handleFacilitiesWithWhereQuery(queryLower, params) {
    // Top facilities query by zipcode and rating
    if (queryLower.includes('zipcode') && queryLower.includes('rating')) {
      const zipcode = params[0] || '19104';
      const limit = params[1] || 10;
      const filteredData = this.facilitiesData.filter(f => f.zipcode === zipcode);
      return this.createSuccessResponse(filteredData.slice(0, limit));
    }
    
    // Facilities by city
    if (queryLower.includes('city') && queryLower.includes('ilike')) {
      const city = params[0] || 'Philadelphia';
      const filteredData = this.facilitiesData.filter(f => f.city.toLowerCase().includes(city.toLowerCase()));
      return this.createSuccessResponse(filteredData);
    }
    
    // Facilities by zipcode and city
    if (queryLower.includes('zipcode') && queryLower.includes('city')) {
      const zipcode = params[0] || '19104';
      const city = params[1] || 'Philadelphia';
      const filteredData = this.facilitiesData.filter(f => f.zipcode === zipcode && f.city === city);
      return this.createSuccessResponse(filteredData);
    }
    
    // Default facilities query
    return this.createSuccessResponse(this.facilitiesData);
  }


}

module.exports = FacilitiesMock;
module.exports.createFacilitiesMock = createFacilitiesMock; 