-- Affordable ZIP Codes Query
-- Returns affordable ZIP codes below a price threshold
-- Parameters: $1 = maxPrice, $2 = limit

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE medianlistingprice <= $1
  AND medianlistingprice > 0
ORDER BY medianlistingprice ASC
LIMIT $2; 