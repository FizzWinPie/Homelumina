-- Query: Get Underserved Healthcare Areas
-- Purpose: Identifies ZIP codes with limited healthcare access (hospitals and childcare)
-- Parameters: limit (number of results to return)
-- Returns: ZIP codes ranked by healthcare access score

WITH healthcare_metrics AS (
  SELECT 
    z.zipcode,
    z.city,
    z.state,
    COALESCE(z.population, 0) as population,
    COALESCE(h.count, 0) as hospital_count,
    COALESCE(cc.count, 0) as childcare_count,
    AVG(lm.medianlistingprice) as avg_price,
    CASE 
      WHEN COALESCE(h.count, 0) = 0 THEN 0
      WHEN z.population > 0 THEN 
        ROUND((COALESCE(h.count, 0)::numeric / z.population * 10000), 2)
      ELSE 0
    END as healthcare_score
  FROM zipcode z
  LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
  LEFT JOIN (
    SELECT zipcode, COUNT(*) as count 
    FROM hospitals 
    GROUP BY zipcode
  ) h ON z.zipcode = h.zipcode
  LEFT JOIN (
    SELECT zipcode, COUNT(*) as count 
    FROM childcarecenters 
    GROUP BY zipcode
  ) cc ON z.zipcode = cc.zipcode
  WHERE lm.medianlistingprice > 0 AND z.population > 1000
  GROUP BY z.zipcode, z.city, z.state, z.population, h.count, cc.count
  HAVING COUNT(lm.zipcode) >= 2
)
SELECT 
  zipcode,
  city,
  state,
  population,
  hospital_count,
  childcare_count,
  ROUND(avg_price::numeric, 2) as avg_price,
  healthcare_score,
  CASE 
    WHEN hospital_count = 0 AND childcare_count = 0 THEN 'No Healthcare'
    WHEN hospital_count = 0 THEN 'No Hospitals'
    WHEN childcare_count = 0 THEN 'No Childcare'
    WHEN healthcare_score < 1 THEN 'Low Healthcare'
    WHEN healthcare_score < 3 THEN 'Medium Healthcare'
    ELSE 'Well Served'
  END as healthcare_level
FROM healthcare_metrics
ORDER BY healthcare_score ASC, population DESC
LIMIT $1; 