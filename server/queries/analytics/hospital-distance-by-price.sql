-- Query: Get Hospital Distance by Price Tier
-- Purpose: Analyzes hospital access patterns across different real estate price tiers
-- Parameters: limit (number of results to return)
-- Returns: ZIP codes with hospital access data categorized by price tier

WITH price_tiers AS (
  SELECT 
    z.zipcode,
    z.city,
    z.state,
    COALESCE(z.population, 0) as population,
    AVG(lm.medianlistingprice) as avg_price,
    COUNT(h.zipcode) as hospital_count,
    CASE 
      WHEN AVG(lm.medianlistingprice) > 500000 THEN 'Luxury'
      WHEN AVG(lm.medianlistingprice) > 300000 THEN 'High'
      WHEN AVG(lm.medianlistingprice) > 200000 THEN 'Medium'
      ELSE 'Affordable'
    END as price_tier
  FROM zipcode z
  LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
  LEFT JOIN hospitals h ON z.zipcode = h.zipcode
  WHERE lm.medianlistingprice > 0
  GROUP BY z.zipcode, z.city, z.state, z.population
  HAVING COUNT(lm.zipcode) >= 2
)
SELECT 
  zipcode,
  city,
  state,
  population,
  ROUND(avg_price::numeric, 2) as avg_price,
  hospital_count,
  price_tier,
  CASE 
    WHEN hospital_count = 0 THEN 'No Hospitals'
    WHEN hospital_count = 1 THEN 'Single Hospital'
    WHEN hospital_count <= 3 THEN 'Multiple Hospitals'
    ELSE 'Well Served'
  END as hospital_access
FROM price_tiers
ORDER BY avg_price DESC
LIMIT $1; 