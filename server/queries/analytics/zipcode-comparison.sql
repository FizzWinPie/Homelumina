-- ZIP Code Comparison Query
-- Returns comprehensive comparison data for multiple ZIP codes
-- Parameters: $1 = array of ZIP codes to compare

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
  AVG(lm.medianlistingprice) as avg_price,
  CASE 
    WHEN z.population > 0 THEN 
      ROUND(((COALESCE(cc.count, 0) + COALESCE(h.count, 0) + COALESCE(ps.count, 0) + COALESCE(fs.count, 0))::numeric / z.population * 10000), 2)
    ELSE 0 
  END as facilities_per_10k
FROM zipcode z
LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
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
WHERE z.zipcode = ANY($1)
GROUP BY z.zipcode, z.city, z.state, z.population, cc.count, h.count, ps.count, fs.count
ORDER BY z.zipcode; 