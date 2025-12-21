-- Affordable Housing Options Query
-- Returns affordable housing options below a price threshold
-- Parameters: $1 = maxPrice, $2 = limit

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE medianlistingprice <= $1
  AND medianlistingprice > 0
ORDER BY medianlistingprice DESC
LIMIT $2; 