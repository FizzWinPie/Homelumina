# Tests Documentation

This directory contains comprehensive tests for the CIS 5500 Group 7 API server, organized by test type and functionality.

## 📁 Directory Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── middleware/         # Middleware unit tests
│   └── database/          # Database mocking unit tests
├── integration/            # Integration tests for API endpoints
├── e2e/                   # End-to-end workflow tests
├── fixtures/              # Mock data and test fixtures
├── utils/                 # Test utilities and setup
└── README.md             # This file
```

## 🧪 Test Categories

### Unit Tests (`unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Scope**: Single functions, middleware, utilities
- **Database**: Mocked using `databaseMock` utility
- **Examples**: Validation middleware, database mocking functionality

### Integration Tests (`integration/`)
- **Purpose**: Test API endpoints and their interactions
- **Scope**: Complete request/response cycles
- **Database**: Mocked using `databaseMock` utility
- **Examples**: Facilities API, Real Estate API, Analytics API

### End-to-End Tests (`e2e/`)
- **Purpose**: Test complete user workflows
- **Scope**: Multi-step processes across multiple endpoints
- **Database**: Mocked using `databaseMock` utility
- **Examples**: Complete property search workflow

## 🗄️ Database Mocking

The test suite includes a comprehensive database mocking system that allows you to test your application without requiring a real database connection.

### Key Features

- **Automatic Query Detection**: Automatically detects query types and returns appropriate mock data
- **Custom Response Setup**: Set up specific responses for particular queries
- **Query History Tracking**: Track and verify which queries were executed
- **Error Simulation**: Simulate database errors and connection issues
- **Parameter Verification**: Verify queries were called with correct parameters

### Usage Examples

#### Basic Database Mocking

```javascript
const { testUtils } = require('./utils/testSetup');

describe('My Test', () => {
  beforeEach(() => {
    // Setup database mocks before each test
    testUtils.setupDatabaseMocks();
  });

  afterEach(() => {
    // Reset database mocks after each test
    testUtils.resetDatabaseMocks();
  });

  it('should query facilities', async () => {
    // The mock will automatically return appropriate data
    const response = await request(app)
      .get('/api/v1/facilities/top/19104')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
  });
});
```

#### Custom Database Responses

```javascript
it('should handle custom database response', async () => {
  // Setup specific response for a query
  testUtils.setupDatabaseResponse('SELECT * FROM facilities', {
    rows: [{ id: 1, name: 'Custom Facility' }],
    rowCount: 1
  });

  const response = await request(app)
    .get('/api/v1/facilities/top/19104')
    .expect(200);

  expect(response.body.data[0].name).toBe('Custom Facility');
});
```

#### Database Error Simulation

```javascript
it('should handle database errors', async () => {
  // Setup database error
  testUtils.setupDatabaseError(new Error('Connection failed'));

  const response = await request(app)
    .get('/api/v1/facilities/top/19104')
    .expect(500);

  expect(response.body.error).toContain('Connection failed');
});
```

#### Query Verification

```javascript
it('should verify database queries', async () => {
  await request(app)
    .get('/api/v1/facilities/top/19104')
    .expect(200);

  // Verify specific query was called
  testUtils.verifyDatabaseQuery('facilities', 1);

  // Verify query with parameters
  testUtils.verifyDatabaseQueryWithParams('facilities', ['19104'], 1);

  // Get full query history
  const history = testUtils.getDatabaseQueryHistory();
  expect(history).toHaveLength(1);
});
```

### Mock Data Structure

The database mock uses predefined mock data from `fixtures/mockData.js`:

```javascript
// Facilities data
mockFacilitiesData: [
  {
    id: 1,
    name: 'Test Childcare Center 1',
    type: 'childcare',
    zipcode: '19104',
    city: 'Philadelphia',
    rating: 4.5,
    // ... other properties
  }
]

// Real estate data
mockRealEstateData: [
  {
    id: 1,
    address: '123 Main St, Philadelphia, PA 19104',
    price: 250000,
    bedrooms: 3,
    // ... other properties
  }
]

// Analytics data
mockAnalyticsData: {
  safetyToSaleRatio: [
    {
      city: 'Philadelphia',
      safety_score: 85,
      avg_price: 275000,
      ratio: 0.31
    }
  ]
}
```

### Query Pattern Matching

The database mock automatically detects query types:

- **Facilities queries**: Contains `childcare`, `hospital`, `police`
- **Real estate queries**: Contains `realtor`, `price`, `bedroom`
- **Analytics queries**: Contains `safety`, `ratio`, `population`
- **Health queries**: Contains `current_timestamp`, `pg_tables`
- **Sample data queries**: Contains `limit` and `select`

## 🚀 Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up test environment (optional):
```bash
# Create .env.test file for custom test configuration
cp .env.example .env.test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Environment Variables

Configure test behavior using environment variables:

```bash
# .env.test
NODE_ENV=test
PORT=3001
ENABLE_DB_MOCKS=true
USE_REAL_DB=false
SUPPRESS_CONSOLE=true
```

## 📊 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/utils/testSetup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'app.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ]
};
```

### Test Utilities (`utils/testSetup.js`)

Provides:
- Database mock setup and teardown
- Test data generation
- API response validation
- Environment configuration

## 🎯 Writing Tests

### Unit Test Example

```javascript
const { validateZipcode } = require('../../middleware/validation');
const { mockRequestData } = require('../fixtures/mockData');

describe('validateZipcode', () => {
  it('should validate correct zipcode format', () => {
    const req = { params: { zipcode: mockRequestData.validZipcode } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    validateZipcode(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const { testUtils } = require('../utils/testSetup');
const app = require('../../app');

describe('Facilities API', () => {
  beforeEach(() => {
    testUtils.setupDatabaseMocks();
  });

  it('should return facilities for valid zipcode', async () => {
    const response = await request(app)
      .get('/api/v1/facilities/top/19104')
      .expect(200);

    testUtils.validateApiResponse(response);
    expect(response.body.data).toHaveLength(2);
  });
});
```

### E2E Test Example

```javascript
const request = require('supertest');
const { testUtils } = require('../utils/testSetup');
const app = require('../../app');

describe('Property Search Workflow', () => {
  beforeEach(() => {
    testUtils.setupDatabaseMocks();
  });

  it('should complete property search workflow', async () => {
    // Step 1: Search for facilities
    const facilitiesResponse = await request(app)
      .get('/api/v1/facilities/top/19104')
      .expect(200);

    // Step 2: Search for properties
    const propertiesResponse = await request(app)
      .get('/api/v1/real-estate/search?zipcode=19104')
      .expect(200);

    // Step 3: Get analytics
    const analyticsResponse = await request(app)
      .get('/api/v1/analytics/safety-ratio')
      .expect(200);

    // Verify all responses are successful
    expect(facilitiesResponse.body.success).toBe(true);
    expect(propertiesResponse.body.success).toBe(true);
    expect(analyticsResponse.body.success).toBe(true);
  });
});
```

## 🔧 Best Practices

### Test Organization

1. **Group related tests**: Use `describe` blocks to organize tests logically
2. **Clear test names**: Use descriptive test names that explain the expected behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases

### Database Mocking

1. **Reset mocks**: Always reset database mocks between tests
2. **Use realistic data**: Use mock data that resembles real data structure
3. **Test error scenarios**: Include tests for database errors and edge cases
4. **Verify queries**: Use query verification to ensure correct database interactions

### Test Data

1. **Use fixtures**: Store test data in `fixtures/mockData.js`
2. **Generate dynamic data**: Use `testUtils.generateTestData()` for dynamic test data
3. **Clean up**: Clean up test data after tests (for real database tests)

### Error Testing

1. **Test validation errors**: Verify proper error responses for invalid input
2. **Test database errors**: Simulate and test database connection issues
3. **Test edge cases**: Include tests for boundary conditions and unusual inputs

## 📈 Coverage Goals

- **Unit Tests**: 90%+ coverage for middleware and utilities
- **Integration Tests**: 85%+ coverage for API endpoints
- **E2E Tests**: Cover all major user workflows

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure database mocks are properly set up
2. **Test isolation**: Reset mocks between tests to prevent interference
3. **Async test issues**: Use proper async/await patterns and done callbacks
4. **Mock data issues**: Verify mock data structure matches expected format

### Debug Tips

1. **Enable verbose logging**: Set `SUPPRESS_CONSOLE=false` in test environment
2. **Check query history**: Use `testUtils.getDatabaseQueryHistory()` to debug database calls
3. **Verify mock setup**: Ensure database mocks are initialized before tests
4. **Check test isolation**: Verify tests don't interfere with each other

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Express Testing Guide](https://expressjs.com/en/advanced/best-practices-performance.html#testing) 