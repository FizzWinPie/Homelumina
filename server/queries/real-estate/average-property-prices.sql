-- Average Property Prices Query
-- Returns average property prices by area
-- Parameters: $1 = limit

SELECT 
  zipcode,
  AVG(medianlistingprice) as average_price,
  COUNT(*) as property_count,
  MIN(medianlistingprice) as min_price,
  MAX(medianlistingprice) as max_price
FROM localmarket 
GROUP BY zipcode
ORDER BY average_price DESC
LIMIT $1; 