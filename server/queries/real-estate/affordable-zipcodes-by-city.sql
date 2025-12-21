-- Affordable ZIP Codes by City Query
-- Returns affordable ZIP codes below a price threshold for a specific city and state
-- Parameters: $1 = maxPrice, $2 = city, $3 = state, $4 = limit

SELECT 
  l.zipcode,
  l.medianlistingprice,
  l.monthdate,
  z.city,
  z.state
FROM localmarket l
JOIN zipcode z ON l.zipcode = z.zipcode
WHERE l.medianlistingprice <= $1::integer
  AND l.medianlistingprice > 0
  AND LOWER(z.city) = LOWER($2::varchar)
  AND LOWER(z.state) = LOWER($3::varchar)
ORDER BY l.medianlistingprice ASC
LIMIT $4::integer; 