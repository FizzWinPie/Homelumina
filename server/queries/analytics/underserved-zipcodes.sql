-- Query: Get Underserved ZIP Codes
-- Purpose: Identifies ZIP codes with limited access to essential facilities (childcare, hospitals, police, firefighter)
-- Parameters: limit (number of results to return)
-- Returns: ZIP codes ranked by facility access per 10,000 population

WITH facility_counts AS (
  SELECT 
    z.zipcode,
    z.city,
    z.state,
    COALESCE(z.population, 0) as population,
    COALESCE(cc.count, 0) as childcare_count,
    COALESCE(h.count, 0) as hospital_count,
    COALESCE(ps.count, 0) as police_count,
    COALESCE(fs.count, 0) as firefighter_count
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
  WHERE z.population > 0
)
SELECT 
  zipcode,
  city,
  state,
  population,
  (childcare_count + hospital_count + police_count + firefighter_count) as total_facilities,
  CASE 
    WHEN population > 0 THEN 
      ROUND((childcare_count + hospital_count + police_count + firefighter_count)::numeric / population * 10000, 2)
    ELSE 0 
  END as facilities_per_10k,
  CASE 
    WHEN (childcare_count + hospital_count + police_count + firefighter_count) = 0 THEN 'Critical'
    WHEN (childcare_count + hospital_count + police_count + firefighter_count) <= 2 THEN 'High'
    WHEN (childcare_count + hospital_count + police_count + firefighter_count) <= 5 THEN 'Medium'
    ELSE 'Low'
  END as underserved_level
FROM facility_counts
WHERE population > 1000
ORDER BY facilities_per_10k ASC, population DESC
LIMIT $1; 