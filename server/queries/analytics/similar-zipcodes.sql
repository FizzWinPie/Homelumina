-- Similar ZIP Codes Query
-- Returns the 4 most similar ZIP codes to a given ZIP code based on weighted attributes
-- Parameters: $1 = zipcode

-- WITH firetable AS (
--   SELECT
--     ZipCode,
--     SUM(ActivePersonnel) AS Firefighters,
--     COUNT(DISTINCT DptId) AS FirefighterDepartments
--   FROM FirefighterStations
--   GROUP BY ZipCode
-- ),

-- policetable AS (
--   SELECT
--     ZipCode,
--     SUM(TotalActiveOfficers) AS PoliceOfficers,
--     COUNT(DISTINCT Id) AS PoliceStations
--   FROM PoliceStations
--   GROUP BY ZipCode
-- ),

-- listingtable AS (
--     SELECT
--         zipcode,
--         AVG(medianlistingprice) as avgmedianlistingprice
--     FROM localmarket
--     GROUP BY zipcode
-- ),

-- current_zipcode AS (
--   SELECT
--     z.ZipCode,
--     z.Population,
--     hi.MeanIncome,
--     lt.avgmedianlistingprice,
--     pt.PoliceStations,
--     pt.PoliceOfficers,
--     COUNT(DISTINCT h.Id) AS Hospitals,
--     COUNT(DISTINCT cc.Id) AS ChildcareCenters,
--     ft.FirefighterDepartments,
--     ft.Firefighters,
--     MAX(CASE WHEN hm.Measure = 'Current asthma among adults' THEN hm.Ratio END) AS AsthmaRate,
--     MAX(CASE WHEN hm.Measure = 'Obesity among adults' THEN hm.Ratio END) AS ObesityRate,
--     MAX(CASE WHEN hm.Measure = 'Visits to doctor for routine checkup within the past year among adults' THEN hm.Ratio END) AS DoctorVisitsRate,
--     MAX(CASE WHEN hm.Measure = 'Depression among adults' THEN hm.Ratio END) AS DepressionRate,
--     MAX(CASE WHEN hm.Measure = 'Housing insecurity in the past 12 months among adults' THEN hm.Ratio END) AS HousingInsecurityRate,
--     MAX(CASE WHEN hm.Measure = 'Feeling socially isolated among adults' THEN hm.Ratio END) AS SocialIsolationRate
--   FROM ZipCode z
--   LEFT JOIN HouseholdIncome hi ON z.ZipCode = hi.ZipCode
--   LEFT JOIN HealthMeasure hm ON z.ZipCode = hm.ZipCode
--   LEFT JOIN policetable pt ON z.ZipCode = pt.ZipCode
--   LEFT JOIN firetable ft ON z.ZipCode = ft.ZipCode
--   LEFT JOIN Hospitals h ON z.ZipCode = h.ZipCode
--   LEFT JOIN ChildcareCenters cc ON z.ZipCode = cc.ZipCode
--   LEFT JOIN listingtable lt ON z.zipcode = lt.zipcode
--   WHERE z.ZipCode = $1
--   GROUP BY z.ZipCode, z.Population, hi.MeanIncome, pt.PoliceStations, pt.PoliceOfficers, ft.FirefighterDepartments, ft.Firefighters, lt.avgmedianlistingprice
-- ),

-- all_zipcodes AS (
--   SELECT
--     z.ZipCode,
--     z.Population,
--     hi.MeanIncome,
--     lt.avgmedianlistingprice,
--     pt.PoliceStations,
--     pt.PoliceOfficers,
--     COUNT(DISTINCT h.Id) AS Hospitals,
--     COUNT(DISTINCT cc.Id) AS ChildcareCenters,
--     ft.FirefighterDepartments,
--     ft.Firefighters,
--     MAX(CASE WHEN hm.Measure = 'Current asthma among adults' THEN hm.Ratio END) AS AsthmaRate,
--     MAX(CASE WHEN hm.Measure = 'Obesity among adults' THEN hm.Ratio END) AS ObesityRate,
--     MAX(CASE WHEN hm.Measure = 'Visits to doctor for routine checkup within the past year among adults' THEN hm.Ratio END) AS DoctorVisitsRate,
--     MAX(CASE WHEN hm.Measure = 'Depression among adults' THEN hm.Ratio END) AS DepressionRate,
--     MAX(CASE WHEN hm.Measure = 'Housing insecurity in the past 12 months among adults' THEN hm.Ratio END) AS HousingInsecurityRate,
--     MAX(CASE WHEN hm.Measure = 'Feeling socially isolated among adults' THEN hm.Ratio END) AS SocialIsolationRate
--   FROM ZipCode z
--   LEFT JOIN HouseholdIncome hi ON z.ZipCode = hi.ZipCode
--   LEFT JOIN HealthMeasure hm ON z.ZipCode = hm.ZipCode
--   LEFT JOIN policetable pt ON z.ZipCode = pt.ZipCode
--   LEFT JOIN firetable ft ON z.ZipCode = ft.ZipCode
--   LEFT JOIN Hospitals h ON z.ZipCode = h.ZipCode
--   LEFT JOIN ChildcareCenters cc ON z.ZipCode = cc.ZipCode
--   LEFT JOIN listingtable lt ON z.zipcode = lt.zipcode
--   WHERE z.ZipCode <> $1
--   GROUP BY z.ZipCode, z.Population, hi.MeanIncome, pt.PoliceStations, pt.PoliceOfficers, ft.FirefighterDepartments, ft.Firefighters, lt.avgmedianlistingprice
-- )

-- SELECT
--   az.ZipCode,
--   ROUND(
--     ABS(COALESCE(az.Population, 0) - COALESCE(cz.Population, 0)) * 0.1 +
--     ABS(COALESCE(az.MeanIncome, 0) - COALESCE(cz.MeanIncome, 0)) * 0.1 +
--     ABS(COALESCE(az.avgmedianlistingprice, 0) - COALESCE(cz.avgmedianlistingprice, 0)) * 0.1 +
--     ABS(COALESCE(az.PoliceStations, 0) - COALESCE(cz.PoliceStations, 0)) * 0.05 +
--     ABS(COALESCE(az.PoliceOfficers, 0) - COALESCE(cz.PoliceOfficers, 0)) * 0.05 +
--     ABS(COALESCE(az.Hospitals, 0) - COALESCE(cz.Hospitals, 0)) * 0.1 +
--     ABS(COALESCE(az.ChildcareCenters, 0) - COALESCE(cz.ChildcareCenters, 0)) * 0.1 +
--     ABS(COALESCE(az.FirefighterDepartments, 0) - COALESCE(cz.FirefighterDepartments, 0)) * 0.05 +
--     ABS(COALESCE(az.Firefighters, 0) - COALESCE(cz.Firefighters, 0)) * 0.05 +
--     ABS(COALESCE(az.AsthmaRate, 0) - COALESCE(cz.AsthmaRate, 0)) * 0.05 +
--     ABS(COALESCE(az.ObesityRate, 0) - COALESCE(cz.ObesityRate, 0)) * 0.05 +
--     ABS(COALESCE(az.DoctorVisitsRate, 0) - COALESCE(cz.DoctorVisitsRate, 0)) * 0.05 +
--     ABS(COALESCE(az.DepressionRate, 0) - COALESCE(cz.DepressionRate, 0)) * 0.05 +
--     ABS(COALESCE(az.HousingInsecurityRate, 0) - COALESCE(cz.HousingInsecurityRate, 0)) * 0.05 +
--     ABS(COALESCE(az.SocialIsolationRate, 0) - COALESCE(cz.SocialIsolationRate, 0)) * 0.05
--   ) AS similarity_score
-- FROM all_zipcodes az
-- JOIN current_zipcode cz ON TRUE
-- ORDER BY similarity_score ASC
-- LIMIT 4; 

WITH current_zipcode AS (
  SELECT *
  FROM all_zipcodes
  WHERE ZipCode = $1
)

SELECT
  az.ZipCode,
  ROUND(
    ABS(COALESCE(az.Population, 0) - COALESCE(cz.Population, 0)) * 0.05 +
    ABS(COALESCE(az.MeanIncome, 0) - COALESCE(cz.MeanIncome, 0)) * 0.1 +
    ABS(COALESCE(az.avgmedianlistingprice, 0) - COALESCE(cz.avgmedianlistingprice, 0)) * 0.1 +
    ABS(COALESCE(az.PoliceStations, 0) - COALESCE(cz.PoliceStations, 0)) * 0.05 +
    ABS(COALESCE(az.PoliceOfficers, 0) - COALESCE(cz.PoliceOfficers, 0)) * 0.05 +
    ABS(COALESCE(az.Hospitals, 0) - COALESCE(cz.Hospitals, 0)) * 0.1 +
    ABS(COALESCE(az.ChildcareCenters, 0) - COALESCE(cz.ChildcareCenters, 0)) * 0.1 +
    ABS(COALESCE(az.FirefighterDepartments, 0) - COALESCE(cz.FirefighterDepartments, 0)) * 0.05 +
    ABS(COALESCE(az.Firefighters, 0) - COALESCE(cz.Firefighters, 0)) * 0.05 +
    ABS(COALESCE(az.AsthmaRate, 0) - COALESCE(cz.AsthmaRate, 0)) * 0.05 +
    ABS(COALESCE(az.ObesityRate, 0) - COALESCE(cz.ObesityRate, 0)) * 0.05 +
    ABS(COALESCE(az.DoctorVisitsRate, 0) - COALESCE(cz.DoctorVisitsRate, 0)) * 0.05 +
    ABS(COALESCE(az.DepressionRate, 0) - COALESCE(cz.DepressionRate, 0)) * 0.05 +
    ABS(COALESCE(az.HousingInsecurityRate, 0) - COALESCE(cz.HousingInsecurityRate, 0)) * 0.05 +
    ABS(COALESCE(az.SocialIsolationRate, 0) - COALESCE(cz.SocialIsolationRate, 0)) * 0.05
  ) AS similarity_score
FROM all_zipcodes az
JOIN current_zipcode cz ON TRUE
WHERE az.ZipCode != $1
ORDER BY similarity_score DESC
LIMIT 4;