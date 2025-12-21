-- Average Income by ZIP Code Query
-- Returns income data for a specific ZIP code
-- Parameters: $1 = zipcode

SELECT 
  zipcode,
  avg_income,
  median_income,
  population
FROM mean_income 
WHERE zipcode = $1; 