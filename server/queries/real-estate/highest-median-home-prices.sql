-- Highest Median Home Prices Query
-- Returns ZIP codes with the highest median home prices
-- Parameters: $1 = limit, $2 = monthdate (optional, can be NULL)

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE medianlistingprice > 0
  AND ($2::varchar IS NULL OR monthdate = $2::varchar)
ORDER BY medianlistingprice DESC 
LIMIT $1::integer; 