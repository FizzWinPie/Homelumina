-- Query: Get Location-Based Featured Cities (Optimized)
-- Purpose: Single optimized query for location-based featured cities
-- Parameters: 
--   $1: user_state (state from IP geolocation)
--   $2: limit (number of cities to return)
-- Returns: Array of featured cities in user's state ranked by combined affordability and health scores

-- Step 1: Get cities with optimized filtering
WITH StateCities AS (
  SELECT DISTINCT
    z.city,
    z.state,
    z.population,
    z.zipcode
  FROM zipcode z
  WHERE LOWER(z.state) = LOWER($1::text)
    AND z.population >= 10000  -- Balanced threshold for good coverage
  ORDER BY z.population DESC
  LIMIT 50  -- Limit for geographic diversity
),
-- Step 2: Get all available data for these cities
CityData AS (
  SELECT
    sc.city,
    sc.state,
    sc.population,
    COALESCE(AVG(lm.medianlistingprice), 0) AS avg_listing_price,
    COALESCE(AVG(hm.ratio), 1) AS avg_health_measure
  FROM StateCities sc
  LEFT JOIN localmarket lm ON sc.zipcode = lm.zipcode
  LEFT JOIN healthmeasure hm ON sc.zipcode = hm.zipcode
  GROUP BY sc.city, sc.state, sc.population
),
-- Step 3: Calculate ranks and scores
RankedCities AS (
  SELECT
    city,
    state,
    population,
    avg_listing_price,
    avg_health_measure,
    ROW_NUMBER() OVER (ORDER BY avg_listing_price ASC) AS price_rank,
    ROW_NUMBER() OVER (ORDER BY avg_health_measure ASC) AS health_rank,
    (ROW_NUMBER() OVER (ORDER BY avg_listing_price ASC) + 
     ROW_NUMBER() OVER (ORDER BY avg_health_measure ASC)) AS combined_rank
  FROM CityData
  WHERE avg_listing_price > 0 OR avg_health_measure < 1  -- Include cities with any meaningful data
)
SELECT
  city,
  state,
  population,
  ROUND(avg_listing_price::numeric, 2) AS avg_listing_price,
  ROUND(avg_health_measure::numeric, 2) AS avg_health_measure,
  price_rank,
  health_rank,
  combined_rank
FROM RankedCities
ORDER BY combined_rank ASC
LIMIT $2::integer; 