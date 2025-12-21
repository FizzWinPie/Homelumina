const fs = require('fs').promises;
const path = require('path');

/**
 * Query Loader Utility
 * Loads SQL queries from external files with caching for performance
 */
class QueryLoader {
  constructor() {
    this.cache = new Map();
    this.queriesDir = path.join(__dirname, '../queries');
  }

  /**
   * Load a SQL query from file
   * @param {string} queryName - Name of the query file (without .sql extension)
   * @param {string} subdirectory - Optional subdirectory within queries folder
   * @returns {Promise<string>} The SQL query content
   */
  async loadQuery(queryName, subdirectory = '') {
    const cacheKey = subdirectory ? `${subdirectory}/${queryName}` : queryName;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Build file path
      const filePath = subdirectory 
        ? path.join(this.queriesDir, subdirectory, `${queryName}.sql`)
        : path.join(this.queriesDir, `${queryName}.sql`);

      // Read and cache the query
      const query = await fs.readFile(filePath, 'utf8');
      this.cache.set(cacheKey, query);
      
      return query;
    } catch (error) {
      throw new Error(`Failed to load query '${queryName}': ${error.message}`);
    }
  }

  /**
   * Clear the query cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
module.exports = new QueryLoader(); 