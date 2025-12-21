-- Health Statistics by ZIP Code Query
-- Returns health statistics for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  health_measure,
  COUNT(*) as measure_count,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  MIN(year) as earliest_year,
  MAX(year) as latest_year
FROM healthmeasure 
WHERE zipcode = $1
GROUP BY health_measure
ORDER BY health_measure ASC 