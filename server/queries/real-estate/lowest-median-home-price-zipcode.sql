-- Query: Get Lowest Median Home Price ZIP Code
-- Purpose: Finds the ZIP code with the lowest median home price in a specified city and state
-- Parameters: city (city name), state (state abbreviation)
-- Returns: ZIP code with the lowest median home price and related information

WITH city_zipcodes AS (
    -- Get all zipcodes that belong to the specified city
    SELECT DISTINCT Z.zipcode, Z.city, Z.state
    FROM zipcode Z
    WHERE LOWER(Z.city) = LOWER($1) and LOWER(Z.state) = LOWER($2)
),
     home_prices AS (
         -- Get median home prices for zipcodes in the city
         SELECT
             r.zipcode,
             r.medianlistingprice as median_home_price,
             cz.city,
             cz.state
         FROM localmarket r
                  INNER JOIN city_zipcodes cz ON r.zipcode = cz.zipcode
         WHERE r.medianlistingprice IS NOT NULL
           AND r.medianlistingprice > 1000
     ),
     min_price_info AS (
         -- Find the minimum price and corresponding zipcode
         SELECT
             zipcode,
             median_home_price,
             city,
             state,
             ROW_NUMBER() OVER (ORDER BY median_home_price ASC) as rank
         FROM home_prices
     )
SELECT
    zipcode,
    median_home_price,
    city,
    state,
    rank
FROM min_price_info
WHERE rank = 1; 