-- City Growth Rate Query
-- Returns city growth rate between 2022 and 2025 based on median listing prices
-- Parameters: $1 = city name (case-insensitive), $2 = state abbreviation (case-insensitive)

WITH CityGrowRateOld AS (
    SELECT
        Z.city,
        Z.state,
        Z.avglistingprice AS AvgListingPriceOld
    FROM housing2022_city_view Z
    WHERE Z.City ilike $1
      And Z.state ilike $2
),
     CityGrowRateNew AS (
         SELECT
             Z.city,
             Z.state,
             Z.avglistingprice AS AvgListingPriceNew
         FROM housing2025_city_view Z
         WHERE Z.City ilike $1
           And Z.state ilike $2
     )

SELECT
    CO.city,
    CO.state,
    ROUND(((AvgListingPriceNew - AvgListingPriceOld) / AvgListingPriceOld * 100), 2)::TEXT || '%' AS GrowthRate3Year
FROM CityGrowRateOld CO
         NATURAL JOIN CityGrowRateNew CN; 