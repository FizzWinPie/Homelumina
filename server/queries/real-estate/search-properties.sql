-- Search properties by multiple criteria (localmarket only, with explicit casts)
-- Parameters: $1 = zipcode (optional, varchar), $2 = minPrice (optional, integer), $3 = maxPrice (optional, integer), $4 = limit (integer)
-- Returns properties matching the search criteria
-- Used by: RealEstateRepository.searchProperties()

SELECT 
  zipcode,
  medianlistingprice AS price,
  monthdate,
  activelistingcount
FROM localmarket 
WHERE 1=1
  AND ($1::varchar IS NULL OR zipcode = $1::varchar)
  AND ($2::integer IS NULL OR medianlistingprice >= $2::integer)
  AND ($3::integer IS NULL OR medianlistingprice <= $3::integer)
ORDER BY medianlistingprice ASC 
LIMIT $4; 