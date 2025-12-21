-- Similar Cities Query
-- Returns the 2 most similar cities to a given city based on weighted attributes
-- Parameters: $1 = city name, $2 = state abbreviation

With current_city AS (
         SELECT *
         FROM similar_city_view SC
         WHERE LOWER(SC.city) = LOWER($1) AND LOWER(SC.state) = LOWER($2)
)


SELECT
    az.city,
    az.state,
    ROUND(
            ABS(COALESCE(az.TotalPopulation, 0) - COALESCE(cz.TotalPopulation, 0)) * 0.05 +
            ABS(COALESCE(az.MeanIncome, 0) - COALESCE(cz.MeanIncome, 0)) * 0.1 +
            ABS(COALESCE(az.listingprice, 0) - COALESCE(cz.listingprice, 0)) * 0.1 +
            ABS(COALESCE(az.PoliceStations, 0) - COALESCE(cz.PoliceStations, 0)) * 0.05 +
            ABS(COALESCE(az.PoliceOfficers, 0) - COALESCE(cz.PoliceOfficers, 0)) * 0.05 +
            ABS(COALESCE(az.NumHospitals, 0) - COALESCE(cz.NumHospitals, 0)) * 0.1 +
            ABS(COALESCE(az.NumChildcareCenters, 0) - COALESCE(cz.NumChildcareCenters, 0)) * 0.1 +
            ABS(COALESCE(az.FirefighterDepartments, 0) - COALESCE(cz.FirefighterDepartments, 0)) * 0.05 +
            ABS(COALESCE(az.Firefighters, 0) - COALESCE(cz.Firefighters, 0)) * 0.05 +
            ABS(COALESCE(az.AsthmaRate, 0) - COALESCE(cz.AsthmaRate, 0)) * 0.05 +
            ABS(COALESCE(az.ObesityRate, 0) - COALESCE(cz.ObesityRate, 0)) * 0.05 +
            ABS(COALESCE(az.DepressionRate, 0) - COALESCE(cz.DepressionRate, 0)) * 0.05
    ) AS similarity_score
FROM similar_city_view az
         CROSS JOIN current_city cz
ORDER BY similarity_score ASC
offset 1 rows
    fetch first 2 rows only;