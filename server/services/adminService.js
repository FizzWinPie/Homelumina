const { createServiceError } = require("../utils/errorUtils");
const adminRepository = require("../repositories/adminRepository");

/**
 * Analytics Service
 * Handles business logic for analytics operations
 * Delegates data access to repository layer
 * Uses ResponseUtils for consistent response formatting
 */
class AdminService {
  /**
   * Get Users with business logic
   * @returns {Promise<Object>} Users data
   */
  async getUsers() {
    try {
      // Get data from repository
      const stats = await adminRepository.getUsers();

      // Business logic: Format response
      const formattedData = {
        stats,
      };

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      throw createServiceError("getUsers", error);
    }
  }

  /**
   * Get Users with business logic
   * @returns {Promise<Object>} Users data
   */
  async createUsers(userInfo) {
    try {
      const stats = await adminRepository.createUsers(userInfo);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw createServiceError("createUsers", error);
    }
  }
}

module.exports = new AdminService();
