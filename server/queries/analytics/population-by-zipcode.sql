-- Population by ZIP Code Query
-- Returns population data for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  zipcode,
  population,
  city,
  state
FROM population 
WHERE zipcode = $1 