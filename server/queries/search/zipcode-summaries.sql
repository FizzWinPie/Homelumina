-- Search ZIP codes with comprehensive summary data and multiple filters
-- This query provides a complete view of ZIP codes with all relevant metrics
-- Parameters:
--   $1: state (required)
--   $2: city (optional, can be NULL)
--   $3: healthMeasure (optional, can be NULL)
--   $4: minPrice - Minimum housing price
--   $5: maxPrice - Maximum housing price
--   $6: minIncome - Minimum mean income
--   $7: maxIncome - Maximum mean income
--   $8: maxHealthRatio - Health measure threshold (max)
--   $9: minPoliceDepts - Police departments threshold (min)
--   $10: minPoliceOfficers - Police officer count threshold (min)
--   $11: minHospitals - Hospitals threshold (min)
--   $12: minFireStations - Firefighter stations threshold (min)
--   $13: minFirefighters - Firefighter count threshold (min)
--   $14: minChildcare - Childcare centers threshold (min)
--   $15: minPopulation - Minimum population
--   $16: maxPopulation - Maximum population
--   $17: limit - Result limit

WITH ZipCodesInCityOrState AS (
  SELECT *
  FROM zipcode
  WHERE state = $1
    AND ($2::text IS NULL OR city ILIKE $2)
),
LatestMarket AS (
         SELECT lm.zipcode, lm.medianlistingprice
         FROM market2022_view lm
                  JOIN ZipCodesInCityOrState z ON lm.zipcode = z.zipcode
     ),
IncomeStats AS (
  SELECT hi.zipcode, hi.meanincome
  FROM householdincome hi
  JOIN ZipCodesInCityOrState z ON hi.zipcode = z.zipcode
),
HealthStats AS (
  SELECT hm.zipcode, hm.ratio AS HealthRatio
  FROM healthmeasure hm
  JOIN ZipCodesInCityOrState z ON hm.zipcode = z.zipcode
  WHERE hm.measure = $3
),
PoliceStats AS (
  SELECT ps.zipcode,
         COUNT(*) AS PoliceDeptCount,
         SUM(totalactiveofficers) AS PoliceOfficerCount
  FROM policestations ps
  JOIN ZipCodesInCityOrState z ON ps.zipcode = z.zipcode
  GROUP BY ps.zipcode
),
HospitalStats AS (
  SELECT h.zipcode, COUNT(*) AS HospitalCount
  FROM hospitals h
  JOIN ZipCodesInCityOrState z ON h.zipcode = z.zipcode
  GROUP BY h.zipcode
),
FireStats AS (
  SELECT f.zipcode,
         SUM(numberofstations) AS FireStationCount,
         SUM(activepersonnel) AS FirefighterCount
  FROM firefighterstations f
  JOIN ZipCodesInCityOrState z ON f.zipcode = z.zipcode
  GROUP BY f.zipcode
),
ChildcareStats AS (
  SELECT c.zipcode, COUNT(*) AS ChildcareCount
  FROM childcarecenters c
  JOIN ZipCodesInCityOrState z ON c.zipcode = z.zipcode
  GROUP BY c.zipcode
)
SELECT 
  z.zipcode,
  z.city,
  z.state,
  z.latitude,
  z.longitude,
  COALESCE(z.population, 0) AS population,
  lm.medianlistingprice AS medianprice,
  ins.meanincome AS meanincome,
  hes.healthratio AS healthratio,
  ps.policedeptcount AS policedepartmentscount,
  ps.policeofficercount AS numpoliceofficerscount,
  hos.hospitalcount AS hospitalscount,
  fs.firestationcount AS firestationscount,
  fs.firefightercount AS firefighterscount,
  cs.childcarecount AS childcarecenterscount
FROM ZipCodesInCityOrState z
LEFT OUTER JOIN LatestMarket lm ON z.zipcode = lm.zipcode
LEFT OUTER JOIN IncomeStats ins ON z.zipcode = ins.zipcode
LEFT OUTER JOIN HealthStats hes ON z.zipcode = hes.zipcode
LEFT OUTER JOIN PoliceStats ps ON z.zipcode = ps.zipcode
LEFT OUTER JOIN HospitalStats hos ON z.zipcode = hos.zipcode
LEFT OUTER JOIN FireStats fs ON z.zipcode = fs.zipcode
LEFT OUTER JOIN ChildcareStats cs ON z.zipcode = cs.zipcode
WHERE COALESCE(lm.medianlistingprice, 0) >= $4
  AND COALESCE(lm.medianlistingprice, 0) <= $5
  AND COALESCE(ins.meanincome, 0) >= $6
  AND COALESCE(ins.meanincome, 0) <= $7
  AND COALESCE(hes.healthratio, 1) <= $8
  AND COALESCE(ps.policedeptcount, 0) >= $9
  AND COALESCE(ps.policeofficercount, 0) >= $10
  AND COALESCE(hos.hospitalcount, 0) >= $11
  AND COALESCE(fs.firestationcount, 0) >= $12
  AND COALESCE(fs.firefightercount, 0) >= $13
  AND COALESCE(cs.childcarecount, 0) >= $14
  AND COALESCE(z.population, 0) >= $15
  AND COALESCE(z.population, 0) <= $16
ORDER BY z.zipcode
LIMIT $17; 