-- Health Measure Trends Query
-- Returns health measure trends for a specific ZIP code and measure
-- Parameters: $1 = zipcode, $2 = measure (with ILIKE pattern)

SELECT 
  zipcode,
  measure,
  ratio,
  totalpopulation
FROM healthmeasure 
WHERE zipcode = $1 AND measure ILIKE $2
ORDER BY measure ASC; 