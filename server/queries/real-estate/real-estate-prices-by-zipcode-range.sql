-- Real Estate Prices by ZIP Code Range Query
-- Returns real estate prices within a ZIP code range
-- Parameters: $1 = minZipcode, $2 = maxZipcode

SELECT 
  zipcode,
  medianlistingprice,
  monthdate
FROM localmarket 
WHERE zipcode >= $1 AND zipcode <= $2
  AND medianlistingprice > 0
ORDER BY zipcode, monthdate; 