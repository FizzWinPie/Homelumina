-- Lowest Median Home Prices Query
-- Returns ZIP codes with the lowest median home prices
-- Parameters: $1 = limit

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE medianlistingprice > 0
ORDER BY medianlistingprice ASC
LIMIT $1; 