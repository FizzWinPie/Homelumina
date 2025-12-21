-- Childcare by City Query
-- Returns childcare facilities for a specific city
-- Parameters: $1 = city (with ILIKE pattern), $2 = limit

SELECT 
  cc.id,
  cc.zipcode,
  cc.latitude,
  cc.longitude,
  z.city,
  z.state
FROM childcarecenters cc
JOIN zipcode z ON cc.zipcode = z.zipcode
WHERE z.city ILIKE $1
ORDER BY cc.id DESC
LIMIT $2 