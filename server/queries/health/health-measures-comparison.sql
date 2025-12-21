-- Health Measures Comparison Query
-- Returns health measures comparison between multiple ZIP codes
-- Parameters: $1 = array of zipcodes, $2 = healthMeasure (with ILIKE pattern)

SELECT 
  hm.zipcode,
  hm.health_measure,
  hm.value,
  hm.unit,
  hm.year,
  z.city,
  z.state
FROM healthmeasure hm
LEFT JOIN zipcode z ON hm.zipcode = z.zipcode
WHERE hm.zipcode = ANY($1) AND hm.health_measure ILIKE $2
ORDER BY hm.zipcode, hm.year DESC 