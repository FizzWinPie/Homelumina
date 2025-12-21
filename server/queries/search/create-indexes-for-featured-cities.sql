-- Database Indexes for Featured Cities Optimization
-- Purpose: Create indexes to improve performance of featured cities queries
-- Run this script to optimize query performance

-- Indexes for localmarket table (most important for performance)
CREATE INDEX IF NOT EXISTS idx_localmarket_medianlistingprice ON localmarket(medianlistingprice);

-- Indexes for healthmeasure table (most important for performance)
CREATE INDEX IF NOT EXISTS idx_healthmeasure_ratio ON healthmeasure(ratio);

-- Composite indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_localmarket_zipcode_price ON localmarket(zipcode, medianlistingprice);
CREATE INDEX IF NOT EXISTS idx_healthmeasure_zipcode_ratio ON healthmeasure(zipcode, ratio);

-- Population filter index for zipcode (since zipcode is already indexed)
CREATE INDEX IF NOT EXISTS idx_zipcode_population_filter ON zipcode(population) WHERE population >= 10000;

-- Analyze tables to update statistics
ANALYZE zipcode;
ANALYZE localmarket;
ANALYZE healthmeasure; 