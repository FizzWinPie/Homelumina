const { getRedisClient } = require("../config/redis");
const logger = require("./logger").logger;

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour

const CATEGORIES = ["location", "price-trends", "similar-zipcodes"];

function categoryFromKey(key) {
  const prefix = key.split(":")[0];
  return CATEGORIES.includes(prefix) ? prefix : "other";
}

async function incrHit(key) {
  try {
    const redis = await getRedisClient();
    const category = categoryFromKey(key);
    await redis.incr(`stats:cache_hits:${category}`);
  } catch (err) {
    logger.warn("Redis INCR hit failed", { key, err: err.message });
  }
}

async function incrMiss(key) {
  try {
    const redis = await getRedisClient();
    const category = categoryFromKey(key);
    await redis.incr(`stats:cache_misses:${category}`);
  } catch (err) {
    logger.warn("Redis INCR miss failed", { key, err: err.message });
  }
}

async function getCached(key) {
  try {
    const redis = await getRedisClient();
    const raw = await redis.get(key);
    if (raw) {
      await incrHit(key);
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.warn("Redis get failed, skipping cache", { key, err: err.message });
  }
  return null;
}

async function setCached(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    const redis = await getRedisClient();
    await incrMiss(key);
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn("Redis set failed", { key, err: err.message });
  }
}

/**
 * Get Redis cache hit/miss stats (offload from Postgres).
 * @returns {Promise<Object>} { byCategory, total }
 */
async function getRedisCacheStats() {
  try {
    const redis = await getRedisClient();
    const byCategory = {};
    let totalHits = 0;
    let totalMisses = 0;

    for (const category of CATEGORIES) {
      const hits = parseInt(
        (await redis.get(`stats:cache_hits:${category}`)) || "0",
        10
      );
      const misses = parseInt(
        (await redis.get(`stats:cache_misses:${category}`)) || "0",
        10
      );
      const total = hits + misses;
      totalHits += hits;
      totalMisses += misses;
      byCategory[category] = {
        hits,
        misses,
        total,
        offloadRatio: total > 0 ? (hits / total).toFixed(4) : "0",
      };
    }

    const totalRequests = totalHits + totalMisses;
    return {
      byCategory,
      total: {
        hits: totalHits,
        misses: totalMisses,
        requests: totalRequests,
        offloadRatio:
          totalRequests > 0 ? (totalHits / totalRequests).toFixed(4) : "0",
        description:
          "hits = requests served from Redis (offloaded from Postgres), misses = requests that hit Postgres",
      },
    };
  } catch (err) {
    logger.warn("Redis getRedisCacheStats failed", { err: err.message });
    return { byCategory: {}, total: {}, error: err.message };
  }
}

module.exports = { getCached, setCached, getRedisCacheStats };
