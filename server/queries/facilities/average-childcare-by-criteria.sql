-- Average Childcare by Criteria Query
-- Returns average childcare statistics for a specific city
-- Parameters: $1 = city (with ILIKE pattern)

SELECT 
  COUNT(*) as total_centers,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude
FROM childcarecenters 
WHERE zipcode IN (
  SELECT zipcode FROM zipcode WHERE city ILIKE $1
) 