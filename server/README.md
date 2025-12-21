# Server

A Node.js Express server for the CIS 5500 project with PostgreSQL database connection.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. **Configure Environment Variables:**

   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your actual database credentials
   nano .env
   ```

   **Required Environment Variables:**
   ```env
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-secure-password
   NODE_ENV=development

   MONGO_URI=ask_john
   ```

3. Run the server:

   ```bash
   # Production
   npm start
   
   # Development (with auto-restart)
   npm run dev
   ```

The server will start on http://localhost:3000 by default.

## Security Features

### Database Security
- **Environment Variables**: All database credentials are stored in environment variables, not hardcoded
- **SSL Encryption**: Production connections use proper SSL certificate validation
- **Connection Pooling**: Configurable connection pool with timeout settings
- **Query Timeouts**: Automatic cancellation of long-running queries (30 seconds)
- **Session Security**: Database session-level security settings
- **Graceful Shutdown**: Proper cleanup of database connections

### Security Best Practices
1. **Never commit `.env` files** - They are automatically ignored by `.gitignore`
2. **Use strong passwords** for database users
3. **Create dedicated database users** with minimal required permissions
4. **Enable SSL in production** with proper certificate validation
5. **Regular security updates** for dependencies
6. **Monitor database connections** and query performance

### Production Deployment
For production deployment, ensure:
- `NODE_ENV=production` is set
- SSL certificates are properly configured
- Database user has minimal required permissions
- Firewall rules restrict database access
- Regular security audits are performed

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart

## API Endpoints

### Core Endpoints
- `GET /` - Basic server status
- `GET /db-test` - Test database connection
- `GET /tables` - List all database tables
- `GET /table-structure/:tableName` - Check table structure
- `GET /sample-data/:tableName` - Get sample data from a table

### Analytics Endpoints

#### Top Facilities by Zipcode
- **URL:** `GET /facilities/zipcodes/top`
- **Description:** Get zipcodes with highest combined facilities
- **Query Parameters:**
  - `limit` (optional): Number of results to return (default: 5)
  - `min_total` (optional): Minimum total facilities required (default: 0)
- **Example:**
  ```bash
  curl "http://localhost:3000/facilities/zipcodes/top?limit=10&min_total=50"
  ```

#### Childcare Centers Analysis
- **URL:** `GET /facilities/childcare/average`
- **Description:** Calculate average childcare centers with specific criteria
- **Query Parameters:**
  - `min_hospitals` (optional): Minimum hospitals required (default: 1)
  - `min_police` (optional): Minimum police departments required (default: 5)
  - `max_fire` (optional): Maximum fire departments allowed (default: 0)
- **Example:**
  ```bash
  curl "http://localhost:3000/facilities/childcare/average?min_hospitals=2&min_police=3&max_fire=1"
  ```

### Real Estate Endpoints

#### Lowest Home Price by City
- **URL:** `GET /real-estate/lowest-price`
- **Description:** Find the zipcode with lowest median home price within a specific city
- **Query Parameters:**
  - `city` (required): City name to search for
- **Example:**
  ```bash
  curl "http://localhost:3000/real-estate/lowest-price?city=New%20York"
  ```

#### City Home Prices Comparison
- **URL:** `GET /real-estate/city-prices`
- **Description:** Get all zipcodes and their median home prices in a city, ranked by price
- **Query Parameters:**
  - `city` (required): City name to search for
  - `limit` (optional): Number of results to return (default: 10)
- **Example:**
  ```bash
  curl "http://localhost:3000/real-estate/city-prices?city=Los%20Angeles&limit=5"
  ```

#### Home Price Growth Analysis
- **URL:** `GET /real-estate/price-growth/:zipcode`
- **Description:** Analyze home price growth over the past 5 years for a specific zipcode
- **Path Parameters:**
  - `zipcode` (required): Zipcode to analyze
- **Example:**
  ```bash
  curl "http://localhost:3000/real-estate/price-growth/28557"
  ```
- **Response includes:**
  - Yearly average prices and data points
  - Year-over-year growth percentages
  - 5-year total growth analysis
  - Price range (lowest to highest)

### Public Safety & Health Analytics

#### Underserved ZIP Codes Analysis
- **URL:** `GET /analytics/underserved-zipcodes`
- **Description:** Identify ZIP codes that are underserved in terms of public safety and health by analyzing staffing levels and health outcomes
- **Query Parameters:**
  - `limit` (optional): Number of results to return (default: 10)
  - `min_population` (optional): Minimum population threshold (default: 1000)
  - `staffing_weight` (optional): Weight for staffing deficit in scoring (default: 0.5)
  - `health_weight` (optional): Weight for health risk in scoring (default: 0.5)
  - `include_income` (optional): Include income data in response (default: false)
- **Example:**
  ```bash
  # Basic analysis
  curl "http://localhost:3000/analytics/underserved-zipcodes?limit=5"
  
  # Focus on staffing with higher population threshold
  curl "http://localhost:3000/analytics/underserved-zipcodes?limit=3&min_population=5000&staffing_weight=0.7&health_weight=0.3"
  ```
- **Response includes:**
  - Facility counts (hospitals, police, firefighter stations)
  - Health metrics (obesity, asthma, depression, housing insecurity, social isolation)
  - Income data for context
  - Normalized scores for staffing service and health service (0 = poor, 1 = good)
  - Combined service level score and ranking (higher score = better served)

#### Growth Leaders Analysis
- **URL:** `GET /analytics/growth-leaders`
- **Description:** Find ZIP codes with the greatest level of growth across home sales, health outcomes, and public safety/health facilities
- **Query Parameters:**
  - `limit` (optional): Number of results to return (default: 10)
  - `min_population` (optional): Minimum population threshold (default: 1000)
  - `home_sales_weight` (optional): Weight for home sales growth (default: 0.4)
  - `health_weight` (optional): Weight for health improvements (default: 0.3)
  - `facilities_weight` (optional): Weight for facilities growth (default: 0.3)
  - `time_period` (optional): Years to analyze (default: 5)
- **Example:**
  ```bash
  # Basic growth analysis
  curl "http://localhost:3000/analytics/growth-leaders?limit=5"
  
  # Focus on home sales growth
  curl "http://localhost:3000/analytics/growth-leaders?home_sales_weight=0.6&health_weight=0.2&facilities_weight=0.2&time_period=3"
  ```
- **Response includes:**
  - Home sales growth metrics (early vs recent period averages)
  - Health improvement scores (based on multiple health measures)
  - Facilities growth (total count of public safety/health facilities)
  - Income context for socioeconomic analysis
  - Individual and combined growth scores (0-1 scale)
  - Ranking and summary statistics

**Weighting System Details:**
The growth leaders analysis uses a configurable weighting system where you can specify the importance of each growth dimension:

- **`home_sales_weight`** (default: 0.4 = 40%): Controls how much weight is given to growth in active real estate listings
- **`health_weight`** (default: 0.3 = 30%): Controls how much weight is given to health outcome improvements
- **`facilities_weight`** (default: 0.3 = 30%): Controls how much weight is given to public safety/health facilities

**Weight Configuration Rules:**
- All weights must sum to 1.0 (100%)
- Weights are customizable via query parameters
- If weights don't sum to 1.0, the system will normalize them automatically

**Health Score Calculation:**
The health improvement score (0-1 scale) is calculated from the following health measures:
- Obesity among adults
- Current asthma among adults
- Depression among adults
- Housing insecurity in the past 12 months
- Feeling socially isolated among adults
- Visits to doctor for routine checkup within the past year

**Scoring Methodology:**
- **0** = Poor health outcomes (high rates of health issues)
- **1** = Excellent health outcomes (low rates of health issues)
- The system normalizes health ratios and converts them to a 0-1 scale

**Combined Growth Score Formula:**
```
combined_growth_score = (home_sales_growth_score × home_sales_weight) + 
                       (health_improvement_score × health_weight) + 
                       (facilities_growth_score × facilities_weight)
```

**Use Case Examples:**
```bash
# Health-focused analysis (70% weight on health)
curl "http://localhost:3000/analytics/growth-leaders?health_weight=0.7&home_sales_weight=0.2&facilities_weight=0.1"

# Economic growth focus (60% weight on home sales)
curl "http://localhost:3000/analytics/growth-leaders?home_sales_weight=0.6&health_weight=0.2&facilities_weight=0.2"

# Balanced analysis (default weights)
curl "http://localhost:3000/analytics/growth-leaders"
```

#### Hospital Distance by Price Tier Analysis
- **URL:** `GET /analytics/hospital-distance-by-price`
- **Description:** Analyze average distance to nearest hospital by price tier to understand healthcare accessibility across different income levels
- **Query Parameters:**
  - `limit` (optional): Number of detailed results to return (default: 10)
  - `min_population` (optional): Minimum population threshold (default: 1000)
  - `price_tiers` (optional): Number of price tiers to create (default: 3)
  - `include_details` (optional): Include detailed ZIP code data (default: false)
  - `max_distance` (optional): Maximum distance to consider in miles (default: 50)
- **Example:**
  ```bash
  # Basic analysis with 3 price tiers
  curl "http://localhost:3000/analytics/hospital-distance-by-price"
  
  # Analysis with 4 price tiers and detailed results
  curl "http://localhost:3000/analytics/hospital-distance-by-price?price_tiers=4&include_details=true&limit=20"
  
    # Higher population threshold for more populated areas
  curl "http://localhost:3000/analytics/hospital-distance-by-price?min_population=5000"
  
  # Optimized for performance with distance limits
  curl "http://localhost:3000/analytics/hospital-distance-by-price?max_distance=25&price_tiers=2"
- **Response includes:**
  - Price tier statistics (Low, Medium, High, Premium)
  - Average distance to nearest hospital by tier
  - Price range and population data for each tier
  - Overall statistics across all tiers
  - Detailed ZIP code data (when requested)
  - Distance calculations using Haversine formula

**Price Tiering Methodology:**
- ZIP codes are divided into tiers based on median home prices using NTILE function
- **Low Tier**: Lowest 33% of home prices
- **Medium Tier**: Middle 33% of home prices  
- **High Tier**: Highest 33% of home prices
- **Premium Tier**: When using 4+ tiers, represents the highest price bracket

**Distance Calculation:**
- Uses Haversine formula to calculate great circle distance in miles
- Finds the nearest hospital for each ZIP code
- Considers all hospitals with valid coordinates
- ZIP code centers calculated from available facility locations

**Accessibility Analysis:**
- Compares healthcare access across different income levels
- Identifies potential healthcare deserts in different price segments
- Provides population-weighted analysis of hospital accessibility

**Performance Optimizations:**
- **Smart Filtering**: Focuses on larger hospitals (>50 beds) for more meaningful analysis
- **Distance Limits**: Configurable maximum distance to reduce computational overhead
- **Data Sampling**: Limits data processing to prevent excessive query times
- **Efficient Joins**: Uses DISTINCT ON for faster nearest hospital calculations
- **Query Time**: Typically completes in 5-10 seconds vs 4+ minutes for full dataset

#### Safety to Sale Ratio Analysis
- **URL:** `GET /analytics/safety-sale-ratio`
- **Description:** Rank cities by safety resources relative to real estate sales activity to identify cities with good safety infrastructure compared to their market activity
- **Query Parameters:**
  - `limit` (optional): Number of results to return (default: 20)
  - `min_population` (optional): Minimum population threshold (default: 1000)
  - `sort_order` (optional): Sort order - 'desc' for highest ratio first, 'asc' for lowest (default: 'desc')
  - `include_details` (optional): Include detailed breakdown (default: false)
- **Example:**
  ```bash
  # Basic safety to sale ratio analysis
  curl "http://localhost:3000/analytics/safety-sale-ratio"
  
  # Top 10 cities with highest safety ratios
  curl "http://localhost:3000/analytics/safety-sale-ratio?limit=10&sort_order=desc"
  
  # Cities with lowest safety ratios (potential areas for improvement)
  curl "http://localhost:3000/analytics/safety-sale-ratio?sort_order=asc&limit=15"
  
  # Focus on larger cities with detailed breakdown
  curl "http://localhost:3000/analytics/safety-sale-ratio?min_population=5000&include_details=true"
  ```
- **Response includes:**
  - Safety metrics (hospitals, police stations, fire stations, personnel counts)
  - Sales metrics (active listings, sales records, median prices)
  - Multiple ratio calculations (facilities to listings, personnel to listings, etc.)
  - Combined safety ratio with weighted scoring
  - Individual rankings for different ratio types
  - Summary statistics across all analyzed cities

**Safety to Sale Ratio Methodology:**
The analysis calculates multiple ratios to understand the relationship between safety resources and real estate activity:

**Ratio Calculations:**
- **Facilities to Listings Ratio**: Total safety facilities ÷ Active listings
- **Personnel to Listings Ratio**: Total safety personnel ÷ Active listings  
- **Facilities to Sales Ratio**: Total safety facilities ÷ Sales records
- **Personnel to Sales Ratio**: Total safety personnel ÷ Sales records

**Combined Safety Ratio Formula:**
```
combined_safety_ratio = (facilities_to_listings × 0.3) + 
                       (personnel_to_listings × 0.4) + 
                       (facilities_to_sales × 0.2) + 
                       (personnel_to_sales × 0.1)
```

**Weighting System:**
- **Personnel to Listings (40%)**: Most important - measures staffing relative to market activity
- **Facilities to Listings (30%)**: Second most important - measures infrastructure relative to market activity
- **Facilities to Sales (20%)**: Measures infrastructure relative to transaction volume
- **Personnel to Sales (10%)**: Measures staffing relative to transaction volume

**Interpretation:**
- **Higher ratios** indicate cities with more safety resources relative to their real estate activity
- **Lower ratios** suggest cities where real estate activity outpaces safety infrastructure
- **Balanced ratios** indicate good alignment between safety resources and market activity

**Use Case Examples:**
```bash
# Find cities with excellent safety infrastructure relative to market size
curl "http://localhost:3000/analytics/safety-sale-ratio?sort_order=desc&limit=10"

# Identify cities that may need safety infrastructure investment
curl "http://localhost:3000/analytics/safety-sale-ratio?sort_order=asc&limit=10"

# Analyze larger cities for urban planning insights
curl "http://localhost:3000/analytics/safety-sale-ratio?min_population=10000&include_details=true"

# Compare safety ratios across different market sizes
curl "http://localhost:3000/analytics/safety-sale-ratio?limit=50"
```

**Safety Resources Included:**
- **Hospitals**: Medical facilities with bed counts
- **Police Stations**: Law enforcement facilities with officer counts
- **Fire Stations**: Fire departments with personnel counts
- **Childcare Centers**: Early childhood facilities (included for community safety)

**Real Estate Activity Metrics:**
- **Active Listings**: Current properties on the market
- **Sales Records**: Historical transaction data
- **Median Prices**: Market value indicators
- **Active ZIP Codes**: Geographic market coverage

## Endpoint: GET /analytics/affordable-zipcodes

Find a list of affordable ZIP codes for users by selecting state and/or affordability criteria. Affordability is calculated by the ratio of home price to income. The endpoint joins the income table to home price data and uses aggregation to determine a list of ZIP codes with a price-to-income ratio less than or equal to a specified threshold (default: 3).

### Query Parameters
- `state` (optional): Filter by two-letter state abbreviation (e.g., `CA`, `TX`).
- `max_ratio` (optional, default: 3): Maximum price-to-income ratio to consider affordable.
- `limit` (optional, default: 50): Maximum number of results to return.
- `min_income` (optional, default: 20000): Minimum mean income for ZIP codes to include.
- `min_price` (optional, default: 50000): Minimum median home price for ZIP codes to include.
- `sort_by` (optional, default: `ratio`): Sort results by one of `ratio`, `income`, `price`, or `zipcode`.
- `sort_order` (optional, default: `asc`): Sort order, either `asc` or `desc`.

### Example Requests

**Top 5 affordable ZIP codes in California:**
```
GET /analytics/affordable-zipcodes?state=CA&limit=5
```

**Top 5 affordable ZIP codes in Texas, sorted by highest income:**
```
GET /analytics/affordable-zipcodes?state=TX&limit=5&sort_by=income&sort_order=desc
```

**Top 5 affordable ZIP codes nationwide with max ratio 2, sorted by lowest price:**
```
GET /analytics/affordable-zipcodes?max_ratio=2&limit=5&sort_by=price&sort_order=asc
```

### Example Response
```json
{
  "success": true,
  "data": {
    "affordable_zipcodes": [
      {
        "rank": 1,
        "zipcode": "95646",
        "location": {
          "city": "Kirkwood",
          "state": "CA",
          "latitude": 38.69,
          "longitude": -120.05,
          "population": 188
        },
        "financial_metrics": {
          "annual_income": 143840,
          "home_price": 54500,
          "price_to_income_ratio": 0.379,
          "annual_income_calculated": 1726080
        },
        "market_data": {
          "active_listings": 18,
          "latest_data_month": "202503"
        }
      }
      // ... more results ...
    ],
    "summary_statistics": {
      "total_affordable_zipcodes": 13883,
      "average_price_to_income_ratio": 2.385,
      "min_price_to_income_ratio": 0.379,
      "max_price_to_income_ratio": 3,
      "average_annual_income": 106610,
      "average_home_price": 250645,
      "states_represented": 1
    }
  },
  "metadata": {
    "query": {
      "state": "CA",
      "max_ratio": 3,
      "limit": 5,
      "min_income": 20000,
      "min_price": 50000,
      "sort_by": "ratio",
      "sort_order": "asc"
    },
    "methodology": {
      "affordability_calculation": "Price-to-income ratio = median listing price / annual income",
      "affordability_threshold": "ZIP codes with ratio ≤ 3 are considered affordable",
      "income_calculation": "Annual income = mean income × 12 (monthly to annual conversion)",
      "data_sources": "Income data from householdincome table, home prices from localmarket table"
    },
    "timestamp": "2025-07-05T06:30:16.562Z",
    "endpoint": "/analytics/affordable-zipcodes"
  }
}
```

### Notes
- The endpoint supports flexible filtering and sorting for user-specific affordability analysis.
- Results include detailed location, financial, and market data for each ZIP code.
- Summary statistics are provided for the returned set.

## Endpoint: GET /analytics/underserved-healthcare

Find ZIP codes that are underserved in terms of healthcare resources. This endpoint joins the ZIP code (population) and hospital data, groups by ZIP code, and calculates the ratio of population to number of hospitals. Results are sorted by population per hospital (highest = most underserved).

### Query Parameters
- `limit` (optional, default: 20): Maximum number of results to return.
- `min_population` (optional, default: 1000): Minimum population for ZIP codes to include.
- `max_ratio` (optional): Only include ZIP codes with population/hospital >= this value.

### Example Request
```
GET /analytics/underserved-healthcare?limit=5
```

### Example Response
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "60629",
      "city": "Chicago",
      "state": "IL",
      "population": 114453,
      "hospital_count": "1",
      "pop_per_hospital": "114453.00"
    },
    {
      "zipcode": "78660",
      "city": "Pflugerville",
      "state": "TX",
      "population": 110955,
      "hospital_count": "1",
      "pop_per_hospital": "110955.00"
    }
    // ... more results ...
  ],
  "metadata": {
    "query": {
      "limit": 5,
      "min_population": 1000,
      "max_ratio": null
    },
    "description": "ZIP codes with highest population per hospital (most underserved in healthcare)",
    "endpoint": "/analytics/underserved-healthcare"
  }
}
```

### Notes
- The higher the `pop_per_hospital`, the more underserved the ZIP code is in terms of healthcare facility access.
- Use `max_ratio` to filter for only severely underserved ZIP codes.

## Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "query": { ... },
    "timestamp": "2025-07-04T20:36:49.709Z",
    "endpoint": "/facilities/zipcodes/top"
  }
}
```

### Error Response Format

When errors occur, endpoints return:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Detailed error information",
    "code": "ERROR_CODE"
  }
}
```

## Error Codes

- `MISSING_PARAMETER` - Required parameter not provided
- `NO_DATA_FOUND` - No data matches the query criteria
- `QUERY_EXECUTION_ERROR` - Database query failed
- `INVALID_PARAMETER` - Parameter value is invalid

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (no data available)
- `500` - Internal Server Error

## Data Sources

The server connects to a PostgreSQL database containing the following tables:

### Core Tables
- `hospitals` - Hospital facility data with locations
- `policestations` - Police station locations and details
- `firefighterstations` - Fire department locations
- `childcarecenters` - Childcare facility information
- `zipcode` - ZIP code to city/state mappings
- `city` - City information and demographics

### Analytics Tables
- `healthmeasure` - Health outcome metrics (obesity, asthma, depression, etc.)
- `householdincome` - Income data by ZIP code
- `localmarket` - Real estate market data (prices, listings)

### Data Quality Notes
- Health measures include ratios (0-1 scale) for various health outcomes
- Real estate data uses YYYYMM format for dates
- Population data is included for context in health analyses
- Income data provides socioeconomic context

### Growth Analysis Methodology
**Home Sales Growth:**
- Calculates percentage change in active listings over the specified time period
- Uses early period average vs recent period average comparison
- Normalized to 0-1 scale where 1.0 represents maximum observed growth

**Health Improvement Scoring:**
- Aggregates multiple health outcome measures into a single score
- Higher scores indicate better health outcomes (lower rates of health issues)
- Includes both positive health indicators (routine checkups) and negative indicators (obesity, depression)
- Normalized based on observed ranges in the dataset

**Facilities Growth:**
- Counts total public safety and health facilities per ZIP code
- Includes hospitals, police stations, firefighter stations, and childcare centers
- Normalized to 0-1 scale based on facility density across all ZIP codes

**Combined Scoring:**
- Weighted average of all three growth dimensions
- Configurable weights allow for different analytical priorities
- Ranks ZIP codes by overall growth potential across all dimensions

## Database Configuration

The server is configured to connect to a PostgreSQL database with the following details:
- Host: database-1.ctx0s2sly9f4.us-east-1.rds.amazonaws.com
- Port: 5432
- Database: postgres
- Username: postgres
- SSL: Enabled (required for AWS RDS)

## Usage Examples

### Basic Health Analysis
```bash
# Find most underserved areas
curl "http://localhost:3000/analytics/underserved-zipcodes?limit=5"

# Focus on health outcomes
curl "http://localhost:3000/analytics/underserved-zipcodes?health_weight=0.8&staffing_weight=0.2"

# Find growth leaders across all metrics
curl "http://localhost:3000/analytics/growth-leaders?limit=5"

# Focus on economic growth
curl "http://localhost:3000/analytics/growth-leaders?home_sales_weight=0.7&health_weight=0.2&facilities_weight=0.1"

# Analyze healthcare accessibility by income level
curl "http://localhost:3000/analytics/hospital-distance-by-price?price_tiers=4&include_details=true"

# Compare hospital access across different price segments
curl "http://localhost:3000/analytics/hospital-distance-by-price?min_population=2000"

# Performance-optimized analysis
curl "http://localhost:3000/analytics/hospital-distance-by-price?max_distance=25&price_tiers=2&min_population=5000"

### Real Estate Analysis
```bash
# Compare cities by affordability
curl "http://localhost:3000/real-estate/lowest-price?city=New%20York"
curl "http://localhost:3000/real-estate/lowest-price?city=Los%20Angeles"

# Analyze investment potential
curl "http://localhost:3000/real-estate/price-growth/28557"
```

### Facility Planning
```bash
# Find areas with most facilities
curl "http://localhost:3000/facilities/zipcodes/top?limit=10"

# Analyze childcare distribution
curl "http://localhost:3000/facilities/childcare/average?min_hospitals=2"
```

## Best Practices

### Parameter Selection
- Use `min_population` to filter out small areas for meaningful analysis
- Adjust `staffing_weight` and `health_weight` based on your priorities
- Use `limit` to control response size for large datasets

### Weight Configuration Best Practices
- **Health-Focused Analysis**: Set `health_weight` to 0.6-0.8 for public health research
- **Economic Development**: Set `home_sales_weight` to 0.6-0.8 for real estate investment analysis
- **Infrastructure Planning**: Set `facilities_weight` to 0.6-0.8 for public service planning
- **Balanced Analysis**: Use default weights (0.4, 0.3, 0.3) for general growth assessment
- **Custom Scenarios**: Ensure weights sum to 1.0 for consistent scoring

### Performance Considerations
- Complex queries may take longer for large datasets
- Use appropriate `limit` values to avoid overwhelming responses
- Consider caching results for frequently accessed data

### Data Interpretation
- Service level scores: 0 = underserved, 1 = well served
- Health ratios: Higher values indicate worse health outcomes
- Price growth: Positive percentages indicate appreciation

## Troubleshooting

### Common Issues

**Server won't start:**
- Ensure you're in the `server` directory when running `npm start`
- Check that all dependencies are installed with `npm install`
- Verify database connection credentials

**No data returned:**
- Check if the ZIP code or city exists in the database
- Verify parameter values are within expected ranges
- Use the `/tables` endpoint to see available data

**Slow responses:**
- Reduce the `limit` parameter
- Add `min_population` filters to reduce dataset size
- Check database connection performance

**Parameter errors:**
- Ensure required parameters are provided
- Check parameter value formats (e.g., city names with spaces need URL encoding)
- Verify parameter types (numbers vs. strings)

### Getting Help

1. Check the server logs for detailed error messages
2. Use the `/db-test` endpoint to verify database connectivity
3. Use `/sample-data/:tableName` to explore available data
4. Review the `/table-structure/:tableName` endpoint for data schema

## Complete API Endpoints Reference

This section provides a complete reference for all 16 available endpoints in the server.

### **Total: 16 Endpoints**

---

## **1. Basic/Utility Endpoints**

### **GET /** - Server Status
**Description:** Root endpoint that returns basic server status information.

**Response:**
```json
{
  "message": "Hello, World!",
  "status": "Server is running"
}
```

**Example:**
```bash
curl "http://localhost:3000/"
```

---

### **GET /db-test** - Database Connection Test
**Description:** Test the database connection and return current timestamp.

**Response:**
```json
{
  "message": "Database connection successful",
  "timestamp": "2025-07-05T06:30:00.000Z"
}
```

**Example:**
```bash
curl "http://localhost:3000/db-test"
```

---

### **GET /tables** - List All Tables
**Description:** Retrieve a list of all tables in the database.

**Response:**
```json
{
  "message": "Tables retrieved successfully",
  "count": 12,
  "tables": ["hospitals", "policestations", "firefighterstations", "childcarecenters", "zipcode", "city", "healthmeasure", "householdincome", "localmarket"]
}
```

**Example:**
```bash
curl "http://localhost:3000/tables"
```

---

### **GET /table-structure/:tableName** - Table Structure
**Description:** Get the structure (columns and data types) of a specific table.

**Path Parameters:**
- `tableName` (required): Name of the table to inspect

**Response:**
```json
{
  "table": "hospitals",
  "columns": [
    {"column_name": "id", "data_type": "integer"},
    {"column_name": "name", "data_type": "character varying"},
    {"column_name": "zipcode", "data_type": "character varying"}
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/table-structure/hospitals"
```

---

### **GET /sample-data/:tableName** - Sample Data
**Description:** Get sample data from a specific table (limited to 10 rows).

**Path Parameters:**
- `tableName` (required): Name of the table to get sample data from

**Query Parameters:**
- `limit` (optional, default: 10): Number of sample rows to return

**Response:**
```json
{
  "table": "hospitals",
  "count": 10,
  "data": [
    {"id": 1, "name": "General Hospital", "zipcode": "12345"},
    {"id": 2, "name": "Medical Center", "zipcode": "67890"}
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/sample-data/hospitals?limit=5"
```

---

## **2. Facilities Endpoints**

### **GET /facilities/zipcodes/top** - Top Facilities by ZIP Code
**Description:** Find ZIP codes with the highest combined count of facilities (hospitals, police stations, firefighter stations, childcare centers).

**Query Parameters:**
- `limit` (optional, default: 5): Number of results to return
- `min_total` (optional, default: 0): Minimum total facilities required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "12345",
      "hospital_count": 3,
      "police_count": 2,
      "childcare_count": 5,
      "firefighter_count": 1,
      "total_facilities": 11
    }
  ],
  "metadata": {
    "query": {"limit": 5, "min_total_facilities": 0},
    "summary": {
      "total_results": 5,
      "top_zipcode": "12345",
      "max_facilities": 11
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/facilities/zipcodes/top"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/facilities/zipcodes/top?limit=10&min_total=5"
```

---

### **GET /facilities/childcare/average** - Average Childcare Centers
**Description:** Calculate average childcare centers in ZIP codes that meet specific facility criteria.

**Query Parameters:**
- `min_hospitals` (optional, default: 1): Minimum hospitals required
- `min_police` (optional, default: 5): Minimum police departments required
- `max_fire` (optional, default: 0): Maximum fire departments allowed

**Response:**
```json
{
  "success": true,
  "data": {
    "average_childcare_centers": 3.2,
    "total_zipcodes_analyzed": 45,
    "criteria": {
      "min_hospitals": 1,
      "min_police": 5,
      "max_fire": 0
    }
  },
  "metadata": {
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/facilities/childcare/average"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/facilities/childcare/average?min_hospitals=2&min_police=3&max_fire=1"
```

---

## **3. Real Estate Endpoints**

### **GET /real-estate/lowest-price** - Lowest Home Price by City
**Description:** Find the ZIP code with the lowest median home price within a specific city.

**Query Parameters:**
- `city` (required): City name to search for

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "New York",
    "lowest_price_zipcode": "10001",
    "median_price": 450000,
    "active_listings": 25,
    "latest_data_month": "202412"
  },
  "metadata": {
    "query": {"city": "New York"},
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/real-estate/lowest-price"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/real-estate/lowest-price?city=New%20York"
```

---

### **GET /real-estate/city-prices** - City Home Prices Comparison
**Description:** Get all ZIP codes and their median home prices in a city, ranked by price.

**Query Parameters:**
- `city` (required): City name to search for
- `limit` (optional, default: 10): Number of results to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "10001",
      "city": "New York",
      "median_price": 450000,
      "active_listings": 25,
      "latest_data_month": "202412"
    }
  ],
  "metadata": {
    "query": {"city": "New York", "limit": 10},
    "summary": {
      "total_results": 10,
      "lowest_price": 450000,
      "highest_price": 1200000
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/real-estate/city-prices"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/real-estate/city-prices?city=Los%20Angeles&limit=5"
```

---

### **GET /real-estate/price-growth/:zipcode** - Home Price Growth Analysis
**Description:** Analyze home price growth over the past 5 years for a specific ZIP code.

**Path Parameters:**
- `zipcode` (required): ZIP code to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "zipcode": "28557",
    "yearly_data": [
      {
        "year": 2020,
        "average_price": 180000,
        "data_points": 12,
        "growth_percentage": null
      },
      {
        "year": 2021,
        "average_price": 195000,
        "data_points": 15,
        "growth_percentage": 8.33
      }
    ],
    "summary": {
      "five_year_growth": 25.0,
      "price_range": {"lowest": 150000, "highest": 250000},
      "total_data_points": 60
    }
  },
  "metadata": {
    "query": {"zipcode": "28557"},
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/real-estate/price-growth/28557"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/real-estate/price-growth/28557"
```

---

## **4. Analytics Endpoints**

### **GET /analytics/underserved-zipcodes** - Underserved ZIP Codes Analysis
**Description:** Identify ZIP codes that are underserved in terms of public safety and health by analyzing staffing levels and health outcomes.

**Query Parameters:**
- `limit` (optional, default: 10): Number of results to return
- `min_population` (optional, default: 1000): Minimum population threshold
- `staffing_weight` (optional, default: 0.5): Weight for staffing deficit in scoring
- `health_weight` (optional, default: 0.5): Weight for health risk in scoring
- `include_income` (optional, default: false): Include income data in response

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "12345",
      "city": "Example City",
      "state": "CA",
      "population": 5000,
      "facilities": {
        "hospitals": 0,
        "police_stations": 1,
        "firefighter_stations": 1,
        "childcare_centers": 2
      },
      "health_metrics": {
        "obesity_ratio": 0.35,
        "asthma_ratio": 0.12,
        "depression_ratio": 0.18,
        "housing_insecurity_ratio": 0.08,
        "social_isolation_ratio": 0.22,
        "routine_checkup_ratio": 0.65
      },
      "income_data": {
        "annual_income": 45000
      },
      "scores": {
        "staffing_service_score": 0.3,
        "health_service_score": 0.4,
        "combined_service_score": 0.35,
        "ranking": 1
      }
    }
  ],
  "metadata": {
    "query": {
      "limit": 10,
      "min_population": 1000,
      "staffing_weight": 0.5,
      "health_weight": 0.5
    },
    "summary": {
      "total_results": 10,
      "average_service_score": 0.42,
      "most_underserved_zipcode": "12345"
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/underserved-zipcodes"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/underserved-zipcodes?limit=5&min_population=5000&staffing_weight=0.7&health_weight=0.3"
```

---

### **GET /analytics/growth-leaders** - Growth Leaders Analysis
**Description:** Find ZIP codes with the greatest level of growth across home sales, health outcomes, and public safety/health facilities.

**Query Parameters:**
- `limit` (optional, default: 10): Number of results to return
- `min_population` (optional, default: 1000): Minimum population threshold
- `home_sales_weight` (optional, default: 0.4): Weight for home sales growth
- `health_weight` (optional, default: 0.3): Weight for health improvements
- `facilities_weight` (optional, default: 0.3): Weight for facilities growth
- `time_period` (optional, default: 5): Years to analyze

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "12345",
      "city": "Example City",
      "state": "CA",
      "population": 8000,
      "growth_metrics": {
        "home_sales_growth": {
          "early_period_avg": 15.2,
          "recent_period_avg": 28.5,
          "growth_percentage": 87.5,
          "growth_score": 0.85
        },
        "health_improvement": {
          "health_score": 0.72,
          "improvement_score": 0.65
        },
        "facilities_growth": {
          "total_facilities": 8,
          "facilities_score": 0.78
        }
      },
      "income_data": {
        "annual_income": 65000
      },
      "combined_growth_score": 0.76,
      "ranking": 1
    }
  ],
  "metadata": {
    "query": {
      "limit": 10,
      "min_population": 1000,
      "home_sales_weight": 0.4,
      "health_weight": 0.3,
      "facilities_weight": 0.3,
      "time_period": 5
    },
    "summary": {
      "total_results": 10,
      "average_growth_score": 0.58,
      "top_growth_zipcode": "12345"
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/growth-leaders"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/growth-leaders?home_sales_weight=0.6&health_weight=0.2&facilities_weight=0.2&time_period=3"
```

---

### **GET /analytics/hospital-distance-by-price** - Hospital Distance by Price Tier
**Description:** Calculate average distance to the nearest hospital by price tier, dividing ZIP codes into tiers based on median home prices.

**Query Parameters:**
- `price_tiers` (optional, default: 3): Number of price tiers to create
- `min_population` (optional, default: 1000): Minimum population for ZIP codes to include
- `max_distance` (optional, default: 50): Maximum distance in miles to consider
- `include_details` (optional, default: false): Include detailed hospital information
- `limit` (optional, default: 20): Maximum number of results per tier

**Response:**
```json
{
  "success": true,
  "data": {
    "price_tiers": [
      {
        "tier": 1,
        "price_range": {"min": 50000, "max": 150000},
        "zipcodes_count": 45,
        "average_distance": 12.5,
        "sample_zipcodes": ["12345", "67890"]
      },
      {
        "tier": 2,
        "price_range": {"min": 150001, "max": 300000},
        "zipcodes_count": 78,
        "average_distance": 8.2,
        "sample_zipcodes": ["11111", "22222"]
      }
    ],
    "summary": {
      "total_zipcodes_analyzed": 123,
      "average_distance_overall": 10.3,
      "correlation_analysis": "Higher priced areas tend to have closer hospital access"
    }
  },
  "metadata": {
    "query": {
      "price_tiers": 3,
      "min_population": 1000,
      "max_distance": 50,
      "include_details": false
    },
    "performance": {
      "query_time_ms": 1250,
      "optimizations_applied": ["limited_data_processing", "efficient_joins"]
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/hospital-distance-by-price"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/hospital-distance-by-price?price_tiers=4&include_details=true&min_population=2000"
```

---

### **GET /analytics/safety-sale-ratio** - Safety to Sale Ratio Analysis
**Description:** Rank cities by safety to sale ratio, analyzing the relationship between public safety resources and real estate sales activity.

**Query Parameters:**
- `limit` (optional, default: 20): Number of results to return
- `min_population` (optional, default: 5000): Minimum population threshold
- `sort_by` (optional, default: 'safety_score'): Sort field ('safety_score', 'sales_activity', 'ratio')
- `sort_order` (optional, default: 'desc'): Sort order ('asc', 'desc')
- `include_details` (optional, default: false): Include detailed facility counts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "city": "Example City",
      "state": "CA",
      "population": 25000,
      "safety_metrics": {
        "total_facilities": 15,
        "hospitals": 2,
        "police_stations": 3,
        "firefighter_stations": 2,
        "childcare_centers": 8,
        "facilities_per_capita": 0.0006
      },
      "sales_metrics": {
        "total_listings": 125,
        "median_price": 350000,
        "sales_activity_score": 0.75
      },
      "ratios": {
        "facilities_to_population_ratio": 0.0006,
        "facilities_to_listings_ratio": 0.12,
        "safety_to_sales_ratio": 0.8
      },
      "scores": {
        "safety_score": 0.82,
        "sales_score": 0.75,
        "combined_score": 0.79,
        "ranking": 1
      }
    }
  ],
  "metadata": {
    "query": {
      "limit": 20,
      "min_population": 5000,
      "sort_by": "safety_score",
      "sort_order": "desc"
    },
    "summary": {
      "total_results": 20,
      "average_safety_score": 0.65,
      "average_sales_score": 0.58,
      "top_city": "Example City"
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/safety-sale-ratio"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/safety-sale-ratio?limit=10&min_population=10000&sort_by=ratio&sort_order=desc"
```

---

### **GET /analytics/affordable-zipcodes** - Affordable ZIP Codes Analysis
**Description:** Find a list of affordable ZIP codes for users by selecting state and/or affordability criteria. Affordability is calculated by the ratio of home price to income.

**Query Parameters:**
- `state` (optional): Filter by two-letter state abbreviation (e.g., `CA`, `TX`)
- `max_ratio` (optional, default: 3): Maximum price-to-income ratio to consider affordable
- `limit` (optional, default: 50): Maximum number of results to return
- `min_income` (optional, default: 20000): Minimum annual income threshold
- `min_price` (optional, default: 50000): Minimum home price threshold
- `sort_by` (optional, default: 'ratio'): Sort field ('ratio', 'income', 'price', 'zipcode')
- `sort_order` (optional, default: 'asc'): Sort order ('asc', 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "12345",
      "city": "Example City",
      "state": "CA",
      "population": 5000,
      "latitude": 34.0522,
      "longitude": -118.2437,
      "annual_income": 65000,
      "home_price": 180000,
      "active_listings": 15,
      "latest_data_month": "202412",
      "price_to_income_ratio": 2.77,
      "affordability_percentage": 36.1
    }
  ],
  "metadata": {
    "query": {
      "state": null,
      "max_ratio": 3,
      "limit": 50,
      "min_income": 20000,
      "min_price": 50000,
      "sort_by": "ratio",
      "sort_order": "asc"
    },
    "summary": {
      "total_results": 50,
      "average_ratio": 2.45,
      "most_affordable_zipcode": "12345",
      "average_income": 58000,
      "average_price": 165000
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/affordable-zipcodes"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/affordable-zipcodes?state=CA&max_ratio=2.5&sort_by=income&sort_order=desc"
```

---

### **GET /analytics/underserved-healthcare** - Underserved Healthcare Analysis
**Description:** Find ZIP codes that are underserved in terms of healthcare resources. This endpoint joins the ZIP code (population) and hospital data, groups by ZIP code, and calculates the ratio of population to number of hospitals.

**Query Parameters:**
- `limit` (optional, default: 20): Maximum number of results to return
- `min_population` (optional, default: 1000): Minimum population for ZIP codes to include
- `max_ratio` (optional): Only include ZIP codes with population/hospital >= this value

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "12345",
      "city": "Example City",
      "state": "CA",
      "population": 15000,
      "latitude": 34.0522,
      "longitude": -118.2437,
      "hospital_count": 0,
      "population_per_hospital": null,
      "healthcare_access_score": 0.0,
      "ranking": 1
    },
    {
      "zipcode": "67890",
      "city": "Another City",
      "state": "CA",
      "population": 25000,
      "latitude": 34.0622,
      "longitude": -118.2537,
      "hospital_count": 1,
      "population_per_hospital": 25000,
      "healthcare_access_score": 0.3,
      "ranking": 2
    }
  ],
  "metadata": {
    "query": {
      "limit": 20,
      "min_population": 1000,
      "max_ratio": null
    },
    "summary": {
      "total_results": 20,
      "average_population_per_hospital": 18500,
      "most_underserved_zipcode": "12345",
      "zipcodes_with_no_hospitals": 5
    },
    "timestamp": "2025-07-05T06:30:00.000Z",
    "endpoint": "/analytics/underserved-healthcare"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/analytics/underserved-healthcare?limit=10&min_population=5000&max_ratio=20000"
```

---

## **Endpoint Summary by Category**

| Category | Endpoint Count | Endpoints |
|----------|----------------|-----------|
| **Basic/Utility** | 4 | `/`, `/db-test`, `/tables`, `/table-structure/:tableName`, `/sample-data/:tableName` |
| **Facilities** | 2 | `/facilities/zipcodes/top`, `/facilities/childcare/average` |
| **Real Estate** | 3 | `/real-estate/lowest-price`, `/real-estate/city-prices`, `/real-estate/price-growth/:zipcode` |
| **Analytics** | 6 | `/analytics/underserved-zipcodes`, `/analytics/growth-leaders`, `/analytics/hospital-distance-by-price`, `/analytics/safety-sale-ratio`, `/analytics/affordable-zipcodes`, `/analytics/underserved-healthcare` |

## **Quick Reference by Use Case**

### **Healthcare Analysis**
- `/analytics/underserved-healthcare` - Find areas with poor healthcare access
- `/analytics/hospital-distance-by-price` - Analyze hospital accessibility by income level

### **Real Estate Investment**
- `/analytics/affordable-zipcodes` - Find affordable areas
- `/real-estate/price-growth/:zipcode` - Analyze investment potential
- `/analytics/growth-leaders` - Identify high-growth areas

### **Public Safety Planning**
- `/analytics/underserved-zipcodes` - Identify underserved areas
- `/analytics/safety-sale-ratio` - Analyze safety vs. economic activity
- `/facilities/zipcodes/top` - Find well-served areas

### **Data Exploration**
- `/tables` - See available data
- `/table-structure/:tableName` - Understand data schema
- `/sample-data/:tableName` - Explore sample data

### **City Comparison**
- `/real-estate/city-prices` - Compare home prices within cities
- `/real-estate/lowest-price` - Find most affordable areas in cities

All endpoints return consistent JSON responses with success/error indicators and comprehensive metadata for debugging and analysis.
