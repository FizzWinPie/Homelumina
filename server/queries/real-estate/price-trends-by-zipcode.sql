-- Price Trends by ZIP Code Query
-- Returns price trends over time for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  monthdate,
  medianlistingprice
FROM localmarket 
WHERE zipcode = $1
  AND medianlistingprice > 0
ORDER BY monthdate; 