-- Health Measures by ZIP Code Query
-- Returns health measures data for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  zipcode,
  health_measure,
  value,
  unit,
  year
FROM healthmeasure 
WHERE zipcode = $1
ORDER BY year DESC, health_measure ASC 