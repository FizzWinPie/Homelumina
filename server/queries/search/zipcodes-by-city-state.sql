-- ZIP Codes by City and State Query
-- Returns ZIP codes for a specific city and state
-- Parameters: $1 = city (with ILIKE pattern), $2 = state (with ILIKE pattern)

SELECT zipcode, city, state
FROM zipcode
WHERE city ILIKE $1 AND state ILIKE $2
ORDER BY zipcode 