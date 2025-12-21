-- Location Page Data Query
-- Returns comprehensive location data for a specific ZIP code
-- Parameters: $1 = zipcode

WITH firetable AS (
  SELECT
    ZipCode,
    SUM(ActivePersonnel) AS Firefighters,
    COUNT(DISTINCT DptId) AS FirefighterDepartments
  FROM FirefighterStations
  GROUP BY ZipCode
),
policetable AS (
  SELECT
    ZipCode,
    SUM(TotalActiveOfficers) AS PoliceOfficers,
    COUNT(DISTINCT Id) AS PoliceStations
  FROM PoliceStations
  GROUP BY ZipCode
)
SELECT
  z.ZipCode,
  z.City,
  z.State,
  z.Population,
  hi.MeanIncome,
  lm.MedianListingPrice,
  lm.ActiveListingCount,
  pt.PoliceStations,
  pt.PoliceOfficers,
  COUNT(DISTINCT h.Id) AS Hospitals,
  COUNT(DISTINCT cc.Id) AS ChildcareCenters,
  ft.FirefighterDepartments,
  ft.Firefighters
FROM ZipCode z
LEFT JOIN HouseholdIncome hi ON z.ZipCode = hi.ZipCode
LEFT JOIN LocalMarket lm ON z.ZipCode = lm.ZipCode
LEFT JOIN policetable pt ON z.ZipCode = pt.ZipCode
LEFT JOIN firetable ft ON z.ZipCode = ft.ZipCode
LEFT JOIN Hospitals h ON z.ZipCode = h.ZipCode
LEFT JOIN ChildcareCenters cc ON z.ZipCode = cc.ZipCode
WHERE z.ZipCode = $1
GROUP BY z.ZipCode, z.City, z.State, z.Population,
         hi.MeanIncome, lm.MedianListingPrice, lm.ActiveListingCount,
         pt.PoliceStations, pt.PoliceOfficers,
         ft.FirefighterDepartments, ft.Firefighters,
         lm.monthdate
ORDER BY lm.monthdate DESC
LIMIT 1; 