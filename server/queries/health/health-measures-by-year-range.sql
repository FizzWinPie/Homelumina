-- Get health measures by year range
-- Parameters: $1 = startYear, $2 = endYear, $3 = limit
-- Returns health measures data within specified year range
-- Used by: HealthRepository.getHealthMeasuresByYearRange()

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
WHERE hm.year BETWEEN $1 AND $2
ORDER BY hm.year DESC, hm.health_measure ASC
LIMIT $3; 