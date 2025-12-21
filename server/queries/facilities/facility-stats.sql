-- Get facility statistics by zipcode
-- This query provides statistics for all facility types in a ZIP code
-- Parameters:
--   $1: zipcode - ZIP code to get stats for

SELECT 
  facility_type,
  COUNT(*) as count,
  AVG(rating) as avg_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating
FROM (
  SELECT 'childcare' as facility_type, rating FROM childcarecenters WHERE zipcode = $1
  UNION ALL
  SELECT 'hospital' as facility_type, rating FROM hospitals WHERE zipcode = $1
  UNION ALL
  SELECT 'police' as facility_type, rating FROM policestations WHERE zipcode = $1
  UNION ALL
  SELECT 'firefighter' as facility_type, rating FROM firefighterstations WHERE zipcode = $1
) facilities
GROUP BY facility_type
ORDER BY count DESC; 