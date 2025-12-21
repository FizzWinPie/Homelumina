-- Get growth leaders based on real estate price trends
-- Parameters: $1 = limit
-- Returns ZIP codes with highest average prices and price tiers
-- Used by: AnalyticsRepository.getGrowthLeaders()

SELECT 
  z.zipcode,
  z.city,
  z.state,
  COALESCE(z.population, 0) as population,
  COUNT(lm.zipcode) as listing_count,
  AVG(lm.medianlistingprice) as avg_price,
  MIN(lm.medianlistingprice) as min_price,
  MAX(lm.medianlistingprice) as max_price,
  CASE 
    WHEN AVG(lm.medianlistingprice) > 500000 THEN 'Luxury'
    WHEN AVG(lm.medianlistingprice) > 300000 THEN 'High'
    WHEN AVG(lm.medianlistingprice) > 200000 THEN 'Medium'
    ELSE 'Affordable'
  END as price_tier
FROM zipcode z
LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
WHERE lm.medianlistingprice > 0
GROUP BY z.zipcode, z.city, z.state, z.population
HAVING COUNT(lm.zipcode) >= 3
ORDER BY avg_price DESC
LIMIT $1; 