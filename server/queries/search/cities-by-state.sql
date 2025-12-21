-- Cities by State Query
-- Returns cities for a specific state
-- Parameters: $1 = state (with ILIKE pattern), $2 = limit

SELECT DISTINCT city, state
FROM zipcode
WHERE state ILIKE $1
ORDER BY city
LIMIT $2 