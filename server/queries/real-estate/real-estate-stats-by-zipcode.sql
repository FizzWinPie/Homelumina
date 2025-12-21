-- Real Estate Statistics by ZIP Code Query
-- Returns comprehensive real estate statistics for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  COUNT(*) as total_properties,
  AVG(medianlistingprice) as avg_price,
  MIN(medianlistingprice) as min_price,
  MAX(medianlistingprice) as max_price
FROM localmarket 
WHERE zipcode = $1; 