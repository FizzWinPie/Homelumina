# Architecture Best Practices: Separation of Concerns

## **Why NOT to Keep Queries in Controllers**

### **Problems with Queries in Controllers:**

1. **❌ Violates Single Responsibility Principle**
   - Controllers should handle HTTP logic only
   - Database queries are data access concerns

2. **❌ Hard to Test**
   - Database logic mixed with HTTP logic
   - Difficult to unit test business logic
   - Requires database setup for controller tests

3. **❌ Code Duplication**
   - Same queries used across multiple controllers
   - No centralized query management

4. **❌ Maintenance Nightmare**
   - SQL scattered throughout controllers
   - Hard to optimize or modify queries
   - No query versioning or documentation

5. **❌ Poor Separation of Concerns**
   - Business logic mixed with data access
   - Controllers become bloated and complex

## **Recommended Architecture: Repository Pattern**

### **Layer Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │   Routes    │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │   Utils     │  │ Validators  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Repositories │  │   Models    │  │   Queries   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Database   │  │   Config    │  │   Logging   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### **Directory Structure:**

```
server/
├── controllers/          # HTTP logic only
│   ├── facilitiesController.js
│   ├── realEstateController.js
│   ├── analyticsController.js
│   └── healthController.js
├── services/            # Business logic
│   ├── facilitiesService.js
│   ├── realEstateService.js
│   ├── analyticsService.js
│   └── healthService.js
├── repositories/        # Data access layer
│   ├── facilitiesRepository.js
│   ├── realEstateRepository.js
│   ├── analyticsRepository.js
│   └── healthRepository.js
├── models/             # Data models/schemas
│   ├── Facility.js
│   ├── Property.js
│   └── Analytics.js
├── queries/            # SQL files (optional)
│   ├── facilities/
│   ├── realEstate/
│   └── analytics/
├── middleware/         # HTTP middleware
├── routes/            # Route definitions
├── config/            # Configuration
└── utils/             # Utility functions
```

## **Layer Responsibilities**

### **1. Controllers (Presentation Layer)**
**Purpose:** Handle HTTP requests and responses

**Responsibilities:**
- Parse request parameters
- Call appropriate service methods
- Format HTTP responses
- Handle HTTP-specific errors
- Set response headers

**Example:**
```javascript
class FacilitiesController {
  static async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    try {
      // Delegate to service layer
      return await facilitiesService.getTopFacilitiesByZipcode(zipcode, limit);
    } catch (error) {
      throw new Error(`Error fetching top facilities: ${error.message}`);
    }
  }
}
```

### **2. Services (Business Logic Layer)**
**Purpose:** Handle business logic and orchestration

**Responsibilities:**
- Business rule validation
- Data transformation and formatting
- Business calculations
- Orchestrating multiple repository calls
- Business-specific error handling

**Example:**
```javascript
class FacilitiesService {
  async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    // Business logic: Validate input
    if (!zipcode || zipcode.length !== 5) {
      throw new Error('Invalid ZIP code format');
    }

    // Get data from repository
    const facilities = await facilitiesRepository.getTopFacilitiesByZipcode(zipcode, limit);

    // Business logic: Format response
    const formattedFacilities = facilities.map(facility => ({
      id: facility.id,
      name: facility.name,
      rating: parseFloat(facility.rating),
      // ... more formatting
    }));

    return {
      success: true,
      data: formattedFacilities,
      metadata: { zipcode, totalCount: formattedFacilities.length }
    };
  }
}
```

### **3. Repositories (Data Access Layer)**
**Purpose:** Handle database operations

**Responsibilities:**
- Execute SQL queries
- Handle database connections
- Map database results to domain objects
- Database-specific error handling
- Query optimization

**Example:**
```javascript
class FacilitiesRepository {
  async getTopFacilitiesByZipcode(zipcode, limit = 10) {
    const query = `
      SELECT f.id, f.name, f.rating, f.facility_type
      FROM (
        SELECT id, name, rating, 'childcare' as facility_type
        FROM childcarecenters WHERE zipcode = $1
        UNION ALL
        SELECT id, name, rating, 'hospital' as facility_type
        FROM hospitals WHERE zipcode = $1
      ) f
      ORDER BY f.rating DESC
      LIMIT $2
    `;

    try {
      const result = await db.query(query, [zipcode, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}
```

## **Benefits of This Architecture**

### **✅ Testability**
- Each layer can be tested independently
- Easy to mock dependencies
- Unit tests for business logic
- Integration tests for data access

### **✅ Maintainability**
- Clear separation of concerns
- Easy to modify business logic
- Centralized query management
- Better code organization

### **✅ Reusability**
- Services can be used by multiple controllers
- Repositories can be used by multiple services
- Business logic is not tied to HTTP

### **✅ Scalability**
- Easy to add new features
- Clear boundaries between layers
- Can optimize each layer independently

### **✅ Error Handling**
- Layer-specific error handling
- Clear error propagation
- Better debugging capabilities

## **Testing Strategy**

### **Unit Tests**
```javascript
// Test service layer
describe('FacilitiesService', () => {
  it('should validate zipcode format', async () => {
    const result = await facilitiesService.validateZipcode('12345');
    expect(result.data.isValid).toBe(true);
  });
});
```

### **Integration Tests**
```javascript
// Test repository layer
describe('FacilitiesRepository', () => {
  it('should return facilities for valid zipcode', async () => {
    const facilities = await facilitiesRepository.getTopFacilitiesByZipcode('19104', 5);
    expect(facilities.length).toBeGreaterThan(0);
  });
});
```

### **End-to-End Tests**
```javascript
// Test full request flow
describe('Facilities API', () => {
  it('should return top facilities', async () => {
    const response = await request(app)
      .get('/api/v1/facilities/top/19104')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });
});
```

## **Migration Guide**

### **Step 1: Create Repository Layer**
1. Move SQL queries from controllers to repositories
2. Create repository classes for each domain
3. Update database connection handling

### **Step 2: Create Service Layer**
1. Move business logic from controllers to services
2. Create service classes for each domain
3. Add input validation and data formatting

### **Step 3: Update Controllers**
1. Remove SQL queries from controllers
2. Call service methods instead of direct database access
3. Focus on HTTP-specific logic

### **Step 4: Update Tests**
1. Create unit tests for services
2. Create integration tests for repositories
3. Update existing controller tests

## **Best Practices Summary**

1. **Controllers:** Handle HTTP only
2. **Services:** Handle business logic
3. **Repositories:** Handle data access
4. **Models:** Define data structures
5. **Queries:** Store SQL separately (optional)
6. **Tests:** Test each layer independently
7. **Error Handling:** Handle errors at appropriate layers
8. **Documentation:** Document each layer's responsibilities

This architecture provides a clean, maintainable, and testable codebase that follows industry best practices. 