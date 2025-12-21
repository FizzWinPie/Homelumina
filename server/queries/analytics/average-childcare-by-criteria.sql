-- Average Childcare Centers by Criteria Query
-- Returns statistics about childcare centers in a specific city with rating filter
-- Parameters: $1 = city (with ILIKE pattern), $2 = minRating

SELECT 
  COUNT(*) as total_centers,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,
  AVG(rating) as avg_rating
FROM childcarecenters 
WHERE zipcode IN (
  SELECT zipcode FROM zipcode WHERE city ILIKE $1
)
AND rating >= $2 