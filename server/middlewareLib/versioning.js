/**
 * API Versioning Middleware
 * Handles version detection, routing, and deprecation warnings
 */

const { logger } = require('../utils/logger');

const API_VERSIONS = {
  'v1': {
    version: '1.0.0',
    status: 'stable',
    deprecated: false,
    sunsetDate: null
  }
  // Future versions can be added here
  // 'v2': {
  //   version: '2.0.0',
  //   status: 'beta',
  //   deprecated: false,
  //   sunsetDate: null
  // }
};

/**
 * Extract API version from URL path
 * @param {string} path - Request path
 * @returns {string|null} - Version string or null
 */
const extractVersion = (path) => {
  const versionMatch = path.match(/^\/api\/v(\d+)/);
  return versionMatch ? `v${versionMatch[1]}` : null;
};

/**
 * Check if version is supported
 * @param {string} version - Version string
 * @returns {boolean} - True if supported
 */
const isVersionSupported = (version) => {
  return version && API_VERSIONS[version];
};

/**
 * Check if version is deprecated
 * @param {string} version - Version string
 * @returns {boolean} - True if deprecated
 */
const isVersionDeprecated = (version) => {
  return API_VERSIONS[version]?.deprecated || false;
};

/**
 * Get deprecation warning message
 * @param {string} version - Version string
 * @returns {string} - Warning message
 */
const getDeprecationWarning = (version) => {
  const versionInfo = API_VERSIONS[version];
  if (!versionInfo?.deprecated) return null;
  
  let warning = `API version ${version} is deprecated`;
  if (versionInfo.sunsetDate) {
    warning += `. Sunset date: ${versionInfo.sunsetDate}`;
  }
  warning += '. Please upgrade to the latest version.';
  
  return warning;
};

/**
 * Version detection middleware
 * Adds version information to request object
 */
const versionDetection = (req, res, next) => {
  const version = extractVersion(req.path);
  
  req.apiVersion = version;
  req.isVersioned = !!version;
  req.isLegacy = !version && req.path.startsWith('/api/');
  
  if (version) {
    req.versionInfo = API_VERSIONS[version];
    req.isDeprecated = isVersionDeprecated(version);
  }
  
  next();
};

/**
 * Version validation middleware
 * Validates that the requested version is supported
 */
const versionValidation = (req, res, next) => {
  if (!req.isVersioned) {
    return next(); // Skip for non-versioned routes
  }
  
  if (!isVersionSupported(req.apiVersion)) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported API version',
      message: `API version ${req.apiVersion} is not supported`,
      supportedVersions: Object.keys(API_VERSIONS),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Deprecation warning middleware
 * Adds deprecation warnings to response headers
 */
const deprecationWarning = (req, res, next) => {
  if (req.isDeprecated) {
    const warning = getDeprecationWarning(req.apiVersion);
    if (warning) {
      res.setHeader('X-API-Warning', warning);
      logger.warn(`API version deprecated`, {
        method: req.method,
        url: req.originalUrl,
        version: req.apiVersion,
        warning
      });
    }
  }
  
  next();
};

/**
 * Legacy endpoint warning middleware
 * Warns about using legacy (non-versioned) endpoints
 */
const legacyWarning = (req, res, next) => {
  if (req.isLegacy) {
    const warning = 'This endpoint is deprecated. Please use versioned endpoints (e.g., /api/v1/...) instead.';
    res.setHeader('X-API-Warning', warning);
    logger.warn(`Legacy endpoint used`, {
      method: req.method,
      url: req.originalUrl,
      warning
    });
  }
  
  next();
};

/**
 * API version information endpoint
 */
const getVersionInfo = (req, res) => {
  res.json({
    currentVersion: 'v1',
    versions: API_VERSIONS,
    latest: 'v1',
    deprecated: Object.keys(API_VERSIONS).filter(v => isVersionDeprecated(v)),
    migrationGuide: {
      from: 'legacy',
      to: 'v1',
      changes: [
        'All endpoints now require version prefix: /api/v1/',
        'Enhanced error responses with consistent format',
        'Improved validation and sanitization',
        'Better performance monitoring and logging'
      ]
    }
  });
};

module.exports = {
  versionDetection,
  versionValidation,
  deprecationWarning,
  legacyWarning,
  getVersionInfo,
  API_VERSIONS,
  extractVersion,
  isVersionSupported,
  isVersionDeprecated
}; 