-- Luxury Housing Options Query
-- Returns luxury housing options above a price threshold
-- Parameters: $1 = minPrice, $2 = limit

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE medianlistingprice >= $1
  AND medianlistingprice > 0
ORDER BY medianlistingprice DESC
LIMIT $2; 