-- Query: Get Facilities to Population Ratio by City
-- Purpose: Calculates aggregated facility density metrics for all ZIP codes in a city
-- Parameters: $1 = city name, $2 = state abbreviation
-- Returns: Aggregated facility counts and density metrics for the specified city

WITH city_facilities AS (
  SELECT 
    z.zipcode,
    z.city,
    z.state,
    COALESCE(z.population, 0) as population,
    COALESCE(cc.count, 0) as childcare_count,
    COALESCE(h.count, 0) as hospital_count,
    COALESCE(ps.count, 0) as police_count,
    COALESCE(fs.count, 0) as firefighter_count,
    (COALESCE(cc.count, 0) + COALESCE(h.count, 0) + COALESCE(ps.count, 0) + COALESCE(fs.count, 0)) as total_facilities
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
  WHERE LOWER(z.city) = LOWER($1) AND LOWER(z.state) = LOWER($2)
)
SELECT 
  city,
  state,
  COUNT(zipcode) as total_zipcodes,
  SUM(population) as total_population,
  SUM(childcare_count) as total_childcare,
  SUM(hospital_count) as total_hospitals,
  SUM(police_count) as total_police_stations,
  SUM(firefighter_count) as total_firefighter_stations,
  SUM(total_facilities) as total_facilities,
  CASE 
    WHEN SUM(population) > 0 THEN 
      ROUND((SUM(total_facilities)::numeric / SUM(population) * 10000), 2)
    ELSE 0 
  END as facilities_per_10k,
  CASE 
    WHEN SUM(population) > 0 THEN 
      ROUND((SUM(childcare_count)::numeric / SUM(population) * 10000), 2)
    ELSE 0 
  END as childcare_per_10k,
  CASE 
    WHEN SUM(population) > 0 THEN 
      ROUND((SUM(hospital_count)::numeric / SUM(population) * 10000), 2)
    ELSE 0 
  END as hospitals_per_10k,
  CASE 
    WHEN SUM(population) > 0 THEN 
      ROUND((SUM(police_count)::numeric / SUM(population) * 10000), 2)
    ELSE 0 
  END as police_per_10k,
  CASE 
    WHEN SUM(population) > 0 THEN 
      ROUND((SUM(firefighter_count)::numeric / SUM(population) * 10000), 2)
    ELSE 0 
  END as firefighter_per_10k
FROM city_facilities
GROUP BY city, state; 