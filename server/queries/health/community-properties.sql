-- Community Health Properties Query
-- Returns comprehensive health metrics and hospital data for a specific ZIP code
-- Parameters: $1 = zipcode

WITH hospitalTable AS (
  SELECT
    z.zipcode,
    COUNT(DISTINCT h.id) AS HospitalCount,
    CASE
      WHEN COUNT(DISTINCT h.id) > 0 AND z.population > 0 THEN ROUND(z.population / COUNT(DISTINCT h.id), 2)
      ELSE 0
    END AS HospitalToPopulationRatio,
    CASE
      WHEN SUM(h.numofbeds) > 0 AND z.population > 0 THEN ROUND(z.population / SUM(h.numofbeds), 2)
      ELSE 0
    END AS BedsToPopulationRatio
  FROM zipcode z
  LEFT JOIN hospitals h ON z.zipcode = h.zipcode
  GROUP BY z.zipcode, z.population
)
SELECT
  MAX(CASE WHEN hm.measure = 'Current asthma among adults' THEN hm.ratio END) AS AsthmaRate,
  MAX(CASE WHEN hm.measure = 'Obesity among adults' THEN hm.ratio END) AS ObesityRate,
  MAX(CASE WHEN hm.measure = 'Visits to doctor for routine checkup within the past year among adults' THEN hm.ratio END) AS DoctorVisitsRate,
  MAX(CASE WHEN hm.measure = 'Depression among adults' THEN hm.ratio END) AS DepressionRate,
  MAX(CASE WHEN hm.measure = 'Housing insecurity in the past 12 months among adults' THEN hm.ratio END) AS HousingInsecurityRate,
  MAX(CASE WHEN hm.measure = 'Feeling socially isolated among adults' THEN hm.ratio END) AS SocialIsolationRate,
  ht.HospitalCount,
  ht.HospitalToPopulationRatio,
  ht.BedsToPopulationRatio
FROM zipcode z
LEFT JOIN healthmeasure hm ON z.zipcode = hm.zipcode
LEFT JOIN hospitalTable ht ON z.zipcode = ht.zipcode
WHERE z.zipcode = $1
GROUP BY z.zipcode, z.population, ht.HospitalCount, ht.HospitalToPopulationRatio, ht.BedsToPopulationRatio; 