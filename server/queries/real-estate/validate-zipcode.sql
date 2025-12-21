-- Validate ZIP Code Query
-- Checks if a ZIP code has real estate data
-- Parameters: $1 = zipcode

SELECT COUNT(*) as count
FROM localmarket 
WHERE zipcode = $1; 