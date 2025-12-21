-- Search health measures by multiple criteria with dynamic filtering
-- Parameters: $1 = healthMeasure (optional), $2 = city (optional), $3 = zipcode (optional),
--            $4 = minYear (optional), $5 = maxYear (optional), $6 = minValue (optional),
--            $7 = maxValue (optional), $8 = limit
-- Returns health measures matching the search criteria
-- Used by: HealthRepository.searchHealthMeasures()
--
-- This query handles dynamic filtering based on optional parameters
-- All parameters are optional and use NULL checks for conditional filtering

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
WHERE 1=1
  AND ($1 IS NULL OR hm.health_measure ILIKE $1)
  AND ($2 IS NULL OR z.city ILIKE $2)
  AND ($3 IS NULL OR hm.zipcode = $3)
  AND ($4 IS NULL OR $4 = 1900 OR hm.year >= $4)
  AND ($5 IS NULL OR $5 = 2100 OR hm.year <= $5)
  AND ($6 IS NULL OR $6 = 0 OR hm.value >= $6)
  AND ($7 IS NULL OR $7 = 999999999 OR hm.value <= $7)
ORDER BY hm.year DESC, hm.health_measure ASC
LIMIT $8; 