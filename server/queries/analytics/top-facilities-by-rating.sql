-- Top Facilities by Rating Query
-- Returns top facilities by rating for a specific facility type
-- Parameters: $1 = facilityType, $2 = limit

SELECT 
  id,
  zipcode,
  latitude,
  longitude,
  rating,
  name
FROM childcarecenters 
WHERE rating > 0
ORDER BY rating DESC
LIMIT $2 