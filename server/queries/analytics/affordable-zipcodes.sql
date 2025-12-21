-- Get affordable ZIP codes based on maximum price threshold
-- Parameters: $1 = maxPrice, $2 = limit
-- Returns ZIP codes with affordable housing options
-- Used by: AnalyticsRepository.getAffordableZipcodes()

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
    WHEN AVG(lm.medianlistingprice) <= 150000 THEN 'Very Affordable'
    WHEN AVG(lm.medianlistingprice) <= 250000 THEN 'Affordable'
    WHEN AVG(lm.medianlistingprice) <= 350000 THEN 'Moderate'
    ELSE 'Expensive'
  END as affordability_level
FROM zipcode z
LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
WHERE lm.medianlistingprice > 0 
  AND lm.medianlistingprice <= $1
GROUP BY z.zipcode, z.city, z.state, z.population
HAVING COUNT(lm.zipcode) >= 2
ORDER BY avg_price ASC
LIMIT $2; 