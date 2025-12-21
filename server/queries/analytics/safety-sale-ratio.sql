-- Safety to Sale Ratio Query
-- Returns ZIP codes with the best safety-to-sale price ratios
-- Parameters: $1 = limit (number of results to return)

WITH safety_metrics AS (
  SELECT 
    z.zipcode,
    z.city,
    z.state,
    COALESCE(z.population, 0) as population,
    COALESCE(ps.count, 0) as police_count,
    COALESCE(fs.count, 0) as firefighter_count,
    AVG(lm.medianlistingprice) as avg_price,
    CASE 
      WHEN COALESCE(ps.count, 0) + COALESCE(fs.count, 0) = 0 THEN 0
      WHEN z.population > 0 THEN 
        ROUND(((COALESCE(ps.count, 0) + COALESCE(fs.count, 0))::numeric / z.population * 10000), 2)
      ELSE 0
    END as safety_score
  FROM zipcode z
  LEFT JOIN localmarket lm ON z.zipcode = lm.zipcode
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
  WHERE lm.medianlistingprice > 0 AND z.population > 1000
  GROUP BY z.zipcode, z.city, z.state, z.population, ps.count, fs.count
  HAVING COUNT(lm.zipcode) >= 2
)
SELECT 
  zipcode,
  city,
  state,
  population,
  police_count,
  firefighter_count,
  ROUND(avg_price::numeric, 2) as avg_price,
  safety_score,
  CASE 
    WHEN safety_score = 0 THEN 'No Safety Services'
    WHEN safety_score < 1 THEN 'Low Safety'
    WHEN safety_score < 3 THEN 'Medium Safety'
    ELSE 'High Safety'
  END as safety_level,
  CASE 
    WHEN avg_price > 500000 THEN 'Luxury'
    WHEN avg_price > 300000 THEN 'High'
    WHEN avg_price > 200000 THEN 'Medium'
    ELSE 'Affordable'
  END as price_tier
FROM safety_metrics
ORDER BY safety_score DESC, avg_price DESC
LIMIT $1; 