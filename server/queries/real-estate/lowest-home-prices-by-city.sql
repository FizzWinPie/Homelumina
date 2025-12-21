-- Lowest Home Prices by City Query
-- Returns the lowest priced properties in a specific city
-- Parameters: $1 = city name (case-insensitive), $2 = limit

SELECT 
  r.id,
  r.zipcode,
  r.price,
  r.bedrooms,
  r.bathrooms,
  r.sqft,
  r.property_type,
  r.address,
  r.city,
  r.state,
  r.latitude,
  r.longitude,
  r.listing_date
FROM realtor r
WHERE r.city ILIKE $1
ORDER BY r.price ASC
LIMIT $2; 