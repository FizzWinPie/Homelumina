-- City Comparison Data Query
-- Returns comparison data for multiple cities
-- Parameters: $1 = array of city names

SELECT 
  z.city,
  z.state,
  COUNT(DISTINCT z.zipcode) as zipcode_count,
  AVG(p.population) as avg_population,
  COUNT(DISTINCT r.id) as property_count,
  AVG(r.price) as avg_property_price
FROM zipcode z
LEFT JOIN population p ON z.zipcode = p.zipcode
LEFT JOIN realtor r ON z.zipcode = r.zipcode
WHERE z.city = ANY($1)
GROUP BY z.city, z.state
ORDER BY z.city 