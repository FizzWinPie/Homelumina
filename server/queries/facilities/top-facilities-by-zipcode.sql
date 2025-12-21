-- Get top facilities by zipcode
-- This query combines all facility types (childcare, hospital, police, firefighter) for a given ZIP code
-- Parameters:
--   $1: zipcode - ZIP code to search
--   $2: limit - Number of results to return

SELECT 
  f.facility_id,
  f.facility_type,
  f.zipcode,
  f.latitude,
  f.longitude
FROM (
  SELECT id as facility_id, 'childcare' as facility_type, zipcode, latitude, longitude
  FROM childcarecenters 
  WHERE zipcode = $1
  UNION ALL
  SELECT id as facility_id, 'hospital' as facility_type, zipcode, latitude, longitude
  FROM hospitals 
  WHERE zipcode = $1
  UNION ALL
  SELECT id as facility_id, 'police' as facility_type, zipcode, latitude, longitude
  FROM policestations 
  WHERE zipcode = $1
  UNION ALL
  SELECT dptid as facility_id, 'firefighter' as facility_type, zipcode, NULL as latitude, NULL as longitude
  FROM firefighterstations 
  WHERE zipcode = $1
) f
ORDER BY f.facility_id DESC
LIMIT $2; 