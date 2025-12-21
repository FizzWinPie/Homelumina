const axios = require('axios');
const { logger } = require('./logger');

// Simple in-memory cache for IP geolocation (5 minute TTL)
const ipCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get test IP address from environment variable or use fallback
 * @returns {string} Test IP address for localhost/private IPs
 */
function getTestIP() {
  return process.env.TEST_IP || null; // Return null if TEST_IP is missing
}

/**
 * Get user location from IP address using optimized geolocation API
 * @param {string} ip - User's IP address
 * @returns {Promise<Object>} Location object with city and state
 */
async function getUserLocationFromIP(ip) {
  try {
    // For localhost and private IPs, use a test IP for geolocation
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      const testIP = getTestIP();
      if (!testIP) {
        logger.warn('TEST_IP environment variable not set, returning null for local/private IP geolocation', { 
          originalIP: ip 
        });
        return null; // Return null to trigger fallback to default featured cities
      }
      logger.debug('Using test IP for local/private IP geolocation', { 
        originalIP: ip, 
        testIP: testIP 
      });
      
      // Use the test IP for geolocation lookup
      return await performGeolocationLookup(testIP);
    }

    // For real IPs, perform normal geolocation lookup
    return await performGeolocationLookup(ip);
  } catch (error) {
    logger.error('Failed to get location from IP, using fallback', { 
      ip, 
      error: error.message 
    });
  
    // Fallback to default location
    return {
      city: 'New York',
      state: 'NY',
      country: 'US',
      latitude: 40.7128,
      longitude: -74.0060
    };
  }
}

/**
 * Perform geolocation lookup for a given IP address
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Location object
 */
async function performGeolocationLookup(ip) {
  // Check cache first
  const cacheKey = `ip_${ip}`;
  const cached = ipCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    logger.debug('Using cached location for IP', { ip });
    return cached.data;
  }

  // Use faster geolocation service with shorter timeout
  const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
    timeout: 2000, // Reduced from 5000ms to 2000ms
    headers: {
      'User-Agent': 'HomeLumina-API/1.0'
    }
  });

  if (response.data && response.data.city && response.data.region_code) {
    const locationData = {
      city: response.data.city,
      state: response.data.region_code,
      country: response.data.country,
      latitude: response.data.latitude,
      longitude: response.data.longitude
    };

    // Cache the result
    ipCache.set(cacheKey, {
      data: locationData,
      timestamp: Date.now()
    });

    logger.info('Location retrieved from IP', { 
      ip, 
      city: response.data.city, 
      state: response.data.region,
      country: response.data.country 
    });
    
    return locationData;
  } else {
    throw new Error('Invalid response from geolocation service');
  }
}

/**
 * Extract IP address from request object
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIP(req) {
  // Check for forwarded headers (common with proxies)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP header
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

module.exports = {
  getUserLocationFromIP,
  getClientIP,
  getTestIP
}; 