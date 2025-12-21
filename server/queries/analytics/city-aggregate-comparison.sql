-- City Aggregate Comparison Query
-- Returns city-level aggregate comparison for hospitals, police, firefighters, income, population, and health data
-- Parameters: $1 = city name (case-insensitive), $2 = state abbreviation (case-insensitive)

SELECT city,
       state,
       totalpopulation,
       meanincome,
       listingprice,
       firefighterdepartments AS numfiredept,
       firefighters AS numfirefighters,
       policestations AS numpolicedept,
       numchildcarecenters AS numchildcarecenter,
       numhospitals AS numhospitals,
       obesityrate AS obesityrate,
       asthmarate AS asthmarate,
       depressionrate AS depressionrate
FROM similar_city_view SC
WHERE LOWER(SC.city) = LOWER($1) AND LOWER(SC.state) = LOWER($2)
