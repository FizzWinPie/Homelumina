-- Real Estate Statistics by ZIP Code Query
-- Returns real estate statistics for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  COUNT(*) as total_properties,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM realtor 
WHERE zipcode = $1 