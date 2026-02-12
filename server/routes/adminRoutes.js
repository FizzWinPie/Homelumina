const express = require("express");
const { asyncHandler } = require("../middlewareLib/errorHandler");
const { logger } = require("../utils/logger");
const AdminController = require("../controllers/adminController");
const { getRedisCacheStats } = require("../utils/redisCache");

const router = express.Router();

router.get(
  "/redis-cache-stats",
  asyncHandler(async (req, res) => {
    const stats = await getRedisCacheStats();
    return res.json(stats);
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    logger.info("Fetching all users");

    const result = await AdminController.getUsers();

    logger.info("Info about users fetched successfully");

    return res.json(result);
  })
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    logger.info("Saving user in MongoDB");

    const result = await AdminController.createUsers(req.body);

    logger.info("User saved successfully");

    return res.json(result);
  })
);

module.exports = router;
