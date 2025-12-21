const mongoose = require("../config/mongodb");
const User = require("../models/User");

/**
 * Admin Repository
 * Handles all database operations for admin data
 */
class AdminRepository {
  /**
   * Get users from MongoDB
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new Error(`Database error in getUsers: ${error.message}`);
    }
  }

  /**
   * Create users in MongoDB
   * @returns {Promise<Array>} Info about the user
   */
  async createUsers(userInfo) {
    try {
      const users = await User.create(userInfo);
      return users;
    } catch (error) {
      throw new Error(`Database error in createUsers: ${error.message}`);
    }
  }
}

module.exports = new AdminRepository();
