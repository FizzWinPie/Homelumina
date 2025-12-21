-- Health Measures by ZIP Code Query
-- Returns health measures data for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  zipcode,
  measure,
  ratio,
  totalpopulation
FROM healthmeasure 
WHERE zipcode = $1
ORDER BY measure ASC; 