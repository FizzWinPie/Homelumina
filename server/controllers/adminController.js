const adminService = require("../services/adminService");
const ResponseUtils = require("../utils/responseUtils");

/**
 * Admin Controller
 * Handles HTTP requests for admin endpoints
 * Delegates business logic to service layer
 * Uses ResponseUtils for consistent response formatting
 */
class AdminController {
  /**
   * Get users information
   * @returns {Promise<Object>} Formatted response with users data
   */
  static async getUsers() {
    try {
      const result = await adminService.getUsers();
      return ResponseUtils.formatSuccess(result.data, {
        type: "users",
      });
    } catch (error) {
      throw new Error(`Error getting users information: ${error.message}`);
    }
  }

  /**
   * Save user information to MongoDB
   * @returns {Promise<Object>} Formatted response with users data
   */
  static async createUsers(userInfo) {
    try {
      const result = await adminService.createUsers(userInfo);
      return ResponseUtils.formatSuccess(result.data, {
        type: "users",
      });
    } catch (error) {
      throw new Error(`Error getting users information: ${error.message}`);
    }
  }
}

module.exports = AdminController;
