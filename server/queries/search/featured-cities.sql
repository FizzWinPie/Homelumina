-- Query: Get Featured Cities
-- Purpose: Finds cities with the best combination of affordability and health metrics
-- Parameters: limit (number of cities to return)
-- Returns: Array of featured cities ranked by combined affordability and health scores

WITH CityPriceRank AS (
  SELECT DISTINCT
    z.city,
    z.state,
    SUM(z.population) AS population,
    AVG(lm.medianlistingprice) AS avg_listing_price,
    RANK() OVER (ORDER BY AVG(lm.medianlistingprice) ASC) AS price_rank
  FROM zipcode z 
  JOIN localmarket lm ON z.zipcode = lm.zipcode
  WHERE lm.medianlistingprice > 0
  GROUP BY z.city, z.state
),
CityHealthRank AS (
  SELECT DISTINCT
    z.city,
    z.state,
    SUM(z.population) AS population,
    AVG(hm.ratio) AS avg_health_measure,
    RANK() OVER (ORDER BY AVG(hm.ratio) ASC) AS health_rank
  FROM zipcode z 
  JOIN healthmeasure hm ON z.zipcode = hm.zipcode
  WHERE hm.ratio > 0
  GROUP BY z.city, z.state
)
SELECT DISTINCT
  cpr.city,
  cpr.state,
  cpr.population,
  ROUND(cpr.avg_listing_price::numeric, 2) AS avg_listing_price,
  ROUND(chr.avg_health_measure::numeric, 2) AS avg_health_measure,
  cpr.price_rank,
  chr.health_rank,
  (cpr.price_rank + chr.health_rank) AS combined_rank
FROM CityPriceRank cpr
  JOIN CityHealthRank chr
  ON cpr.city = chr.city AND cpr.state = chr.state
WHERE cpr.population >= 100000
ORDER BY (cpr.price_rank + chr.health_rank) ASC
LIMIT $1; 