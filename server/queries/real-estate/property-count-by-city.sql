-- Property Count by City Query
-- Returns property count statistics for a specific city
-- Parameters: $1 = city name (case-insensitive)

SELECT 
  city,
  COUNT(*) as total_properties,
  COUNT(DISTINCT zipcode) as unique_zipcodes
FROM realtor 
WHERE city ILIKE $1
GROUP BY city; 