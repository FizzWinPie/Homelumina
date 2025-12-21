-- Get available health measures with statistics
-- Returns distinct health measures with count and population range
-- Used by: HealthRepository.getAvailableHealthMeasures()

SELECT DISTINCT 
  measure,
  COUNT(*) as measure_count,
  MIN(totalpopulation) as min_population,
  MAX(totalpopulation) as max_population
FROM healthmeasure 
GROUP BY measure
ORDER BY measure ASC; 