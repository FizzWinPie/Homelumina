-- Autocomplete Suggestions Query
-- Returns autocomplete suggestions for ZIP codes, cities, and states
-- Parameters: $1 = searchTerm (ZIP code prefix), $2 = searchTerm (city/state contains), $3 = searchTerm (state contains), $4 = limit

SELECT * FROM (
(SELECT z.zipcode AS value, 'ZipCode' AS matchType
 FROM zipcode z
 WHERE z.zipcode LIKE $1)
UNION ALL
(SELECT DISTINCT
   CONCAT(city, ', ', state) AS value,
   'City' AS matchType
 FROM zipcode
 WHERE CONCAT(city, ', ', state) ILIKE $2)
UNION ALL
(SELECT DISTINCT state AS value, 'State' AS matchType
 FROM zipcode
 WHERE state ILIKE $3)
)
ORDER BY
  CASE matchType WHEN 'State' THEN 1
    WHEN 'City' THEN 2
    WHEN 'ZipCode' THEN 3
    ELSE 4
  END,
  value
LIMIT $4 