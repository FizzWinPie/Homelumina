-- Validate if zipcode has facilities
-- This query checks if a ZIP code has any facilities across all facility types
-- Parameters:
--   $1: zipcode - ZIP code to validate

SELECT COUNT(*) as count
FROM (
  SELECT zipcode FROM childcarecenters WHERE zipcode = $1
  UNION ALL
  SELECT zipcode FROM hospitals WHERE zipcode = $1
  UNION ALL
  SELECT zipcode FROM policestations WHERE zipcode = $1
  UNION ALL
  SELECT zipcode FROM firefighterstations WHERE zipcode = $1
) facilities; 