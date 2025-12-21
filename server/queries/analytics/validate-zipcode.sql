-- Validate if zipcode has analytics data
-- Parameters: $1 = zipcode
-- Returns count of records across analytics tables
-- Used by: AnalyticsRepository.validateZipcode()

SELECT COUNT(*) as count
FROM (
  SELECT zipcode FROM population WHERE zipcode = $1
  UNION ALL
  SELECT zipcode FROM healthmeasure WHERE zipcode = $1
  UNION ALL
  SELECT zipcode FROM realtor WHERE zipcode = $1
) analytics_data; 