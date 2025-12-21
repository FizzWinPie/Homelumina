-- Query: Get Facilities to Population Ratio
-- Purpose: Calculates facility density (facilities per 10,000 population) for a specific ZIP code
-- Parameters: zipcode (ZIP code to analyze)
-- Returns: Facility counts and density metrics for the specified ZIP code

SELECT 
  z.zipcode,
  z.city,
  z.state,
  COALESCE(z.population, 0) as population,
  COALESCE(cc.count, 0) as childcare_count,
  COALESCE(h.count, 0) as hospital_count,
  COALESCE(ps.count, 0) as police_count,
  COALESCE(fs.count, 0) as firefighter_count,
  (COALESCE(cc.count, 0) + COALESCE(h.count, 0) + COALESCE(ps.count, 0) + COALESCE(fs.count, 0)) as total_facilities,
  CASE 
    WHEN z.population > 0 THEN 
      ROUND(((COALESCE(cc.count, 0) + COALESCE(h.count, 0) + COALESCE(ps.count, 0) + COALESCE(fs.count, 0))::numeric / z.population * 10000), 2)
    ELSE 0 
  END as facilities_per_10k
FROM zipcode z
LEFT JOIN (
  SELECT zipcode, COUNT(*) as count 
  FROM childcarecenters 
  GROUP BY zipcode
) cc ON z.zipcode = cc.zipcode
LEFT JOIN (
  SELECT zipcode, COUNT(*) as count 
  FROM hospitals 
  GROUP BY zipcode
) h ON z.zipcode = h.zipcode
LEFT JOIN (
  SELECT zipcode, COUNT(*) as count 
  FROM policestations 
  GROUP BY zipcode
) ps ON z.zipcode = ps.zipcode
LEFT JOIN (
  SELECT zipcode, COUNT(*) as count 
  FROM firefighterstations 
  GROUP BY zipcode
) fs ON z.zipcode = fs.zipcode
WHERE z.zipcode = $1; 