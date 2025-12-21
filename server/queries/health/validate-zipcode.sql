-- Validate if zipcode has health data
-- Parameters: $1 = zipcode
-- Returns count of health measure records for the zipcode
-- Used by: HealthRepository.validateZipcode()

SELECT COUNT(*) as count
FROM healthmeasure 
WHERE zipcode = $1; 