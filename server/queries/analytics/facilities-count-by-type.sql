-- Facilities Count by Type Query
-- Returns count of different facility types for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  'childcare' as type,
  COUNT(*) as count
FROM childcarecenters 
WHERE zipcode = $1
UNION ALL
SELECT 
  'hospital' as type,
  COUNT(*) as count
FROM hospitals 
WHERE zipcode = $1
UNION ALL
SELECT 
  'police' as type,
  COUNT(*) as count
FROM policestations 
WHERE zipcode = $1
UNION ALL
SELECT 
  'firefighter' as type,
  COUNT(*) as count
FROM firefighterstations 
WHERE zipcode = $1 