# Database Mock Modules

This directory contains a modular database mocking system that separates concerns by functionality, making the codebase more maintainable and easier to understand.

## Structure

```
mocks/
├── BaseMock.js          # Common functionality for all mocks
├── AnalyticsMock.js     # Handles analytics-related queries
├── RealEstateMock.js    # Handles real estate-related queries
├── FacilitiesMock.js    # Handles facilities-related queries
├── HealthMock.js        # Handles health-related queries
├── DatabaseMock.js      # Main orchestrator that routes queries
├── index.js             # Exports all mock classes
└── README.md           # This documentation
```

## Usage

### Basic Usage (Recommended)

```javascript
const { DatabaseMock } = require('./mocks');

const dbMock = new DatabaseMock();
const mockPool = dbMock.createMockPool();

// Use mockPool in your tests
```

### Advanced Usage (Direct Access to Specialized Mocks)

```javascript
const { 
  DatabaseMock, 
  AnalyticsMock, 
  RealEstateMock,
  FacilitiesMock,
  HealthMock 
} = require('./mocks');

// Create specialized mocks directly
const analyticsMock = new AnalyticsMock();
const realEstateMock = new RealEstateMock();
```

### Legacy Usage (Backward Compatibility)

```javascript
const DatabaseMock = require('../databaseMock');

const dbMock = new DatabaseMock();
const mockPool = dbMock.createMockPool();
```

## Mock Classes

### BaseMock
Contains common functionality shared across all mock types:
- Query history recording
- Custom response setup
- Error handling
- Test mock management
- Query verification utilities

### AnalyticsMock
Handles analytics-related database queries:
- Similar cities queries
- Similar ZIP codes queries
- Safety to sale ratio queries
- Growth leaders queries
- Underserved ZIP codes queries
- And more...

### RealEstateMock
Handles real estate-related database queries:
- Lowest price zipcode queries
- Real estate price queries
- Price trend queries
- Average price queries
- Property search queries
- Statistics queries

### FacilitiesMock
Handles facilities-related database queries:
- Childcare queries
- Hospital queries
- Police queries
- General facilities queries with WHERE clauses

### HealthMock
Handles health-related database queries:
- Health check queries
- Table listing queries
- Sample data queries
- Community health queries
- Health statistics queries

### DatabaseMock
Main orchestrator that:
- Routes queries to appropriate specialized mocks
- Provides unified interface for all mock functionality
- Maintains backward compatibility
- Manages mock pool creation and setup

## Query Routing Logic

The `DatabaseMock` routes queries to specialized mocks based on query content:

1. **Analytics Queries**: Contains keywords like 'safety', 'ratio', 'population', 'growth', 'leaders', 'firetable', 'policetable', 'listingtable', 'similarity_score', etc.
2. **Real Estate Queries**: Contains keywords like 'realtor', 'localmarket', 'medianlistingprice', 'price', 'bedroom', 'city_zipcodes', etc.
3. **Facilities Queries**: Contains keywords like 'childcare', 'hospital', 'police', 'facilities'
4. **Health Queries**: Contains keywords like 'select now()', 'information_schema', 'community health', etc.

## Benefits

1. **Separation of Concerns**: Each mock handles only its specific domain
2. **Maintainability**: Easier to find and modify specific query handling logic
3. **Testability**: Can test specialized mocks independently
4. **Extensibility**: Easy to add new specialized mocks for new domains
5. **Backward Compatibility**: Existing tests continue to work without changes
6. **Standardized Logging**: All mocks use the standard logger instead of console.log

## Migration Guide

### From Old Structure to New Structure

**Before:**
```javascript
const DatabaseMock = require('../databaseMock');
```

**After (Recommended):**
```javascript
const { DatabaseMock } = require('./mocks');
```

**After (Direct Access):**
```javascript
const { AnalyticsMock, RealEstateMock } = require('./mocks');
```

### Adding New Query Types

1. Create a new specialized mock class extending `BaseMock`
2. Implement the `handleQuery` method with your query detection logic
3. Add the new mock to the `DatabaseMock` constructor
4. Add routing logic in the `routeQuery` method
5. Update this README with documentation

## Testing

All mock classes include comprehensive test utilities:
- `verifyQuery()`: Verify specific queries were called
- `verifyQueryWithParams()`: Verify queries with specific parameters
- `getQueryHistory()`: Get all recorded queries
- `clearQueryHistory()`: Clear query history
- `setupTestMock()`: Setup test-specific mock data
- `reset()`: Reset mock state

## Logging

All mocks use the standard logger from `../../../utils/logger` instead of console.log, providing:
- Structured logging with metadata
- Configurable log levels
- Consistent formatting across the application 