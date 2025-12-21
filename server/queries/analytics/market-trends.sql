-- Market Trends Query
-- Returns market trends for a specific city over a number of months
-- Parameters: $1 = city, $2 = months

SELECT 
  t.zipcode,
  t.medianlistingprice,
  t.monthdate,
  t.city,
  t.state
FROM (
  SELECT
    lm.zipcode,
    lm.medianlistingprice,
    lm.monthdate,
    z.city,
    z.state,
    TO_DATE(lm.monthdate, 'YYYYMM') AS monthdate_converted
  FROM localmarket lm
  JOIN zipcode z ON lm.zipcode = z.zipcode
  WHERE z.city ILIKE $1
    AND lm.medianlistingprice > 0
    AND lm.monthdate ~ '^[0-9]{6}$'
) t
WHERE t.monthdate_converted >= CURRENT_DATE - ($2 || ' months')::interval
ORDER BY t.monthdate_converted DESC, t.medianlistingprice DESC 