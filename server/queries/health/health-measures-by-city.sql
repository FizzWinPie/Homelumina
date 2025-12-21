-- Health Measures by City Query
-- Returns health measures data for a specific city and state
-- Parameters: $1 = city (ILIKE pattern), $2 = state (ILIKE pattern), $3 = limit

SELECT 
  hm.zipcode,
  hm.measure,
  hm.ratio,
  hm.totalpopulation,
  z.city,
  z.state
FROM healthmeasure hm
JOIN zipcode z ON hm.zipcode = z.zipcode
WHERE z.city ILIKE $1
  AND z.state ILIKE $2
ORDER BY hm.measure ASC
LIMIT $3; 