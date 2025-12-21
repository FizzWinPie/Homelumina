-- Simple query to get top cities by quality of life score
-- Using basic data to avoid complex joins that might cause issues
SELECT 
    city,
    state,
    SUM(population) as total_population,
    COUNT(*) as zipcode_count,
    -- Simple quality score based on population and zipcode count
    (SUM(population) / 1000 + COUNT(*) * 10) as quality_of_life_score
FROM zipcode 
WHERE population > 1000
GROUP BY city, state
HAVING COUNT(*) > 0
ORDER BY quality_of_life_score DESC
LIMIT $1; 