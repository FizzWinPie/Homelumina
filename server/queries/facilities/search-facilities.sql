-- Search facilities by multiple criteria with dynamic facility type handling
-- Parameters: $1 = facilityType (optional), $2 = zipcode (optional), $3 = city (optional), 
--            $4 = limit
-- Returns facilities matching the search criteria
-- Used by: FacilitiesRepository.searchFacilities()

-- Single facility type search (when facilityType is provided)
SELECT 
  facility_id,
  $1::varchar as facility_type,
  zipcode,
  latitude,
  longitude
FROM (
  SELECT id as facility_id, zipcode, latitude, longitude
  FROM childcarecenters 
  WHERE $1::varchar = 'childcare'
  
  UNION ALL
  
  SELECT id as facility_id, zipcode, latitude, longitude
  FROM hospitals 
  WHERE $1::varchar = 'hospital'
  
  UNION ALL
  
  SELECT id as facility_id, zipcode, latitude, longitude
  FROM policestations 
  WHERE $1::varchar = 'police'
  
  UNION ALL
  
  SELECT dptid as facility_id, zipcode, NULL as latitude, NULL as longitude
  FROM firefighterstations 
  WHERE $1::varchar = 'firefighter'
) facilities
WHERE 1=1
  AND ($2::varchar IS NULL OR zipcode = $2::varchar)
  AND ($3::varchar IS NULL OR zipcode IN (SELECT zipcode FROM zipcode WHERE city ILIKE $3::varchar))
ORDER BY facility_id DESC
LIMIT $4::integer; 