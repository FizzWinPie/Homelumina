/**
 * Prometheus metrics for the Homelumina API.
 * Exposes default Node.js metrics, HTTP request metrics, and optional cache counters.
 */

const client = require("prom-client");

const register = new client.Registry();

// Cache categories (must match server/utils/redisCache.js)
const CATEGORIES = ["location", "price-trends", "similar-zipcodes"];

// Default Node.js metrics (event loop, heap, CPU, etc.)
client.collectDefaultMetrics({ register });

// HTTP request counter: method, route (normalized), status
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Cache hit/miss counters by category (optional; also updated from redisCache.js)
const cacheHitsTotal = new client.Counter({
  name: "cache_hits_total",
  help: "Total cache hits by category",
  labelNames: ["category"],
  registers: [register],
});

const cacheMissesTotal = new client.Counter({
  name: "cache_misses_total",
  help: "Total cache misses by category",
  labelNames: ["category"],
  registers: [register],
});

/**
 * Normalize route for low-cardinality labels (strip IDs, query params).
 * e.g. /api/v1/real-estate/price-trends/19104 -> /api/v1/real-estate/price-trends/:zipcode
 */
function normalizeRoute(path) {
  if (!path || path === "/") return path || "/";
  const segments = path.split("?")[0].split("/").filter(Boolean);
  const normalized = segments.map((seg, i) => {
    if (/^\d{5}$/.test(seg)) return ":zipcode";
    if (/^\d+$/.test(seg)) return ":id";
    if (/^[a-zA-Z]+$/.test(seg) && seg.length <= 2) return ":state";
    return seg;
  });
  return "/" + normalized.join("/");
}

/**
 * Middleware: record request start time; on finish, update HTTP counter and duration histogram.
 * Attach after performanceMonitor so we have a stable route (req.originalUrl).
 */
function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  const route = normalizeRoute(req.originalUrl || req.url);

  res.on("finish", () => {
    const status = String(res.statusCode);
    const method = req.method;
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequestsTotal.inc({ method, route, status });
    httpRequestDurationSeconds.observe({ method, route }, durationSec);
  });

  next();
}

/**
 * Increment Prometheus cache hit counter (call from redisCache.incrHit).
 * @param {string} category - One of CATEGORIES or 'other'
 */
function recordCacheHit(category) {
  const safe = CATEGORIES.includes(category) ? category : "other";
  cacheHitsTotal.inc({ category: safe });
}

/**
 * Increment Prometheus cache miss counter (call from redisCache.incrMiss).
 * @param {string} category - One of CATEGORIES or 'other'
 */
function recordCacheMiss(category) {
  const safe = CATEGORIES.includes(category) ? category : "other";
  cacheMissesTotal.inc({ category: safe });
}

/**
 * Return Prometheus text format for GET /metrics.
 */
async function getMetrics() {
  return register.metrics();
}

function getContentType() {
  return register.contentType;
}

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  cacheHitsTotal,
  cacheMissesTotal,
  normalizeRoute,
  metricsMiddleware,
  recordCacheHit,
  recordCacheMiss,
  getMetrics,
  getContentType,
};
