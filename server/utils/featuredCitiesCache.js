/**
 * Featured Cities Cache Utility
 * Purpose: Cache featured cities results for better performance using Node-Cache
 * 
 * Cache Structure:
 * - Default Cache: 1 entry with key 'default_featured_cities' (3 cities for all users)
 * - State-Based Cache: Up to 50 entries (one per US state) with state code as key
 */

const { logger } = require('./logger');
const NodeCache = require('node-cache');

// Cache configuration from environment variables with defaults
const CACHE_TTL_MINUTES = parseInt(process.env.CACHE_TTL_MINUTES) || 30; // Default: 30 minutes
const CACHE_CHECK_PERIOD_MINUTES = parseInt(process.env.CACHE_CHECK_PERIOD_MINUTES) || 10; // Default: 10 minutes
const CACHE_MAX_KEYS = parseInt(process.env.CACHE_MAX_KEYS) || 51; // Default: 50 states + 1 default
const DEFAULT_CITIES_LIMIT = parseInt(process.env.DEFAULT_CITIES_LIMIT) || 3; // Default: 3 cities

// Create cache with configurable options
const featuredCitiesCache = new NodeCache({
  stdTTL: CACHE_TTL_MINUTES * 60,        // Configurable TTL in seconds
  checkperiod: CACHE_CHECK_PERIOD_MINUTES * 60,    // Configurable check period in seconds
  useClones: false,        // Better performance
  maxKeys: CACHE_MAX_KEYS,            // Configurable maximum keys
  deleteOnExpire: true,    // Auto-delete expired keys
  enableLegacyCallbacks: false
});

// Log cache configuration on startup
logger.info('Featured cities cache initialized', {
  ttlMinutes: CACHE_TTL_MINUTES,
  checkPeriodMinutes: CACHE_CHECK_PERIOD_MINUTES,
  maxKeys: CACHE_MAX_KEYS,
  defaultCitiesLimit: DEFAULT_CITIES_LIMIT
});

/**
 * Get cached featured cities for location-based query
 * @param {string} state - State code (e.g., 'PA', 'NY', 'CA')
 * @returns {Array|null} Cached cities or null if not found/expired
 */
function getLocationBasedCached(state) {
  const key = `state:${state.toUpperCase()}`;
  const cached = featuredCitiesCache.get(key);
  
  if (cached) {
    logger.debug('Using cached location-based featured cities', { state });
    return cached;
  }
  
  return null;
}

/**
 * Get cached default featured cities (single set for all users)
 * @returns {Array|null} Cached cities or null if not found/expired
 */
function getDefaultCached() {
  const key = 'default_featured_cities';
  const cached = featuredCitiesCache.get(key);
  
  if (cached) {
    logger.debug('Using cached default featured cities');
    return cached;
  }
  
  return null;
}

/**
 * Set cached featured cities for location-based query
 * @param {string} state - State code (e.g., 'PA', 'NY', 'CA')
 * @param {Array} cities - Cities data to cache (3 cities with full API attributes)
 */
function setLocationBasedCached(state, cities) {
  const key = `state:${state.toUpperCase()}`;
  featuredCitiesCache.set(key, cities, CACHE_TTL_MINUTES * 60); // Use configurable TTL
  
  logger.info('Cached location-based featured cities', { 
    state, 
    resultCount: cities.length,
    ttlMinutes: CACHE_TTL_MINUTES
  });
}

/**
 * Set cached default featured cities (single set for all users)
 * @param {Array} cities - Cities data to cache (3 cities with full API attributes)
 */
function setDefaultCached(cities) {
  const key = 'default_featured_cities';
  featuredCitiesCache.set(key, cities, CACHE_TTL_MINUTES * 60); // Use configurable TTL
  
  logger.info('Cached default featured cities', { 
    resultCount: cities.length,
    ttlMinutes: CACHE_TTL_MINUTES
  });
}

/**
 * Clear all cached data
 */
function clearCache() {
  featuredCitiesCache.flushAll();
  logger.info('Featured cities cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
  const stats = featuredCitiesCache.getStats();
  const keys = featuredCitiesCache.keys();
  
  let stateEntries = 0;
  let defaultEntry = 0;
  
  for (const key of keys) {
    if (key === 'default_featured_cities') {
      defaultEntry = 1;
    } else if (key.startsWith('state:')) {
      stateEntries++;
    }
  }
  
  return {
    totalEntries: stats.keys,
    validEntries: stats.hits,
    expiredEntries: stats.misses,
    defaultCacheEntry: defaultEntry,
    stateCacheEntries: stateEntries,
    maxPossibleStates: 50,
    // Node-Cache specific stats
    hits: stats.hits,
    misses: stats.misses,
    keyCount: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize
  };
}

/**
 * Clean up expired cache entries
 */
function cleanupExpired() {
  // Node-Cache handles this automatically with checkperiod
  logger.debug('Node-Cache handles expiration automatically');
}

module.exports = {
  getLocationBasedCached,
  getDefaultCached,
  setLocationBasedCached,
  setDefaultCached,
  clearCache,
  getCacheStats,
  cleanupExpired
}; 