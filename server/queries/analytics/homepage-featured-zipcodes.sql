-- Homepage Featured ZIP Codes Query
-- Returns ZIP codes with population >= 2000 that have both good social service resources and healthcare resources
-- Parameters: $1 = limit (number of results to return)

WITH facility_counts AS (
  -- Count public safety and health facilities per zipcode
  SELECT
    zipcode,
    COUNT(DISTINCT hospital_id) as hospital_count,
    COUNT(DISTINCT police_id) as police_count,
    COUNT(DISTINCT firefighter_id) as firefighter_count,
    (COUNT(DISTINCT hospital_id) + COUNT(DISTINCT police_id) + COUNT(DISTINCT firefighter_id)) as total_facilities
  FROM (
    SELECT zipcode, CAST(id AS TEXT) as hospital_id, NULL as police_id, NULL as firefighter_id
    FROM hospitals
    UNION ALL
    SELECT zipcode, NULL, CAST(id AS TEXT) as police_id, NULL
    FROM policestations
    UNION ALL
    SELECT zipcode, NULL, NULL, CAST(dptid AS TEXT) as firefighter_id
    FROM firefighterstations
  ) all_facilities
  GROUP BY zipcode
),
health_metrics AS (
  -- Calculate health outcome scores (higher = worse health outcomes)
  SELECT
    zipcode,
    AVG(CASE
      WHEN measure LIKE '%Obesity%' THEN ratio * 100
      WHEN measure LIKE '%asthma%' THEN ratio * 100
      WHEN measure LIKE '%Depression%' THEN ratio * 100
      WHEN measure LIKE '%Housing insecurity%' THEN ratio * 100
      WHEN measure LIKE '%socially isolated%' THEN ratio * 100
      WHEN measure LIKE '%routine checkup%' THEN (1 - ratio) * 100  -- Inverse: lower checkup rate = worse
      ELSE NULL
    END) as avg_poor_health_ratio,
    COUNT(DISTINCT measure) as health_measures_count,
    MAX(totalpopulation) as population
  FROM healthmeasure
  WHERE measure IN (
    'Obesity among adults',
    'Current asthma among adults',
    'Depression among adults',
    'Housing insecurity in the past 12 months among adults',
    'Feeling socially isolated among adults',
    'Visits to doctor for routine checkup within the past year among adults'
  )
  GROUP BY zipcode
),
income_data AS (
  -- Get income data for additional context
  SELECT
    zipcode,
    meanincome
  FROM householdincome
),
combined_metrics AS (
  -- Combine facility counts and health metrics
  SELECT
    fc.zipcode,
    fc.hospital_count,
    fc.police_count,
    fc.firefighter_count,
    fc.total_facilities,
    hm.avg_poor_health_ratio,
    hm.health_measures_count,
    hm.population,
    id.meanincome,
    -- Normalize facility count (0-1 scale, 0 = underserved, 1 = well served)
    CASE
      WHEN fc.total_facilities = 0 THEN 0.0
      WHEN fc.total_facilities >= 10 THEN 1.0
      ELSE fc.total_facilities / 10.0
    END as staffing_service_score,
    -- Normalize health outcomes (0-1 scale, 0 = poor health, 1 = good health)
    CASE
      WHEN hm.avg_poor_health_ratio IS NULL THEN 0.0
      WHEN hm.avg_poor_health_ratio <= 10 THEN 1.0
      WHEN hm.avg_poor_health_ratio >= 50 THEN 0.0
      ELSE 1.0 - ((hm.avg_poor_health_ratio - 10) / 40.0)
    END as health_service_score
  FROM facility_counts fc
  LEFT JOIN health_metrics hm ON fc.zipcode = hm.zipcode
  LEFT JOIN income_data id ON fc.zipcode = id.zipcode
  WHERE hm.population >= 2000
    AND hm.health_measures_count >= 3  -- At least 3 health measures available
),
underserved_ranking AS (
  -- Calculate service level score and rank (higher score = better served)
  SELECT
    *,
    (staffing_service_score * 0.1 + health_service_score * 0.1) as service_level_score,
    ROW_NUMBER() OVER (ORDER BY (staffing_service_score * 0.1 + health_service_score * 0.1) ASC) as rank
  FROM combined_metrics
  WHERE staffing_service_score < 1.0 OR health_service_score < 1.0
)
SELECT
  zipcode,
  hospital_count,
  police_count,
  firefighter_count,
  total_facilities,
  ROUND(avg_poor_health_ratio::numeric, 2) as avg_poor_health_ratio,
  health_measures_count,
  population,
  meanincome,
  ROUND(staffing_service_score::numeric, 3) as staffing_service_score,
  ROUND(health_service_score::numeric, 3) as health_service_score,
  ROUND(service_level_score::numeric, 3) as service_level_score,
  rank
FROM underserved_ranking
ORDER BY service_level_score DESC
LIMIT $1; 