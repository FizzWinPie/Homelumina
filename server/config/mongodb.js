const mongoose = require("mongoose");
const { logger } = require("../utils/logger");
require("dotenv").config();

// Validate required environment variables (skip validation in test environment)
const requiredEnvVars = ["MONGODB_URI"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// Skip validation in test environment to allow mocking
if (missingVars.length > 0 && process.env.NODE_ENV !== "test") {
  logger.error("Missing required environment variables:", { missingVars });
  logger.error("Please include MongoDB URI in your .env file:", {
    requiredVars: ["MONGODB_URI=your-mongodb-connection-string"],
  });
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Setup mongo upon start
connectToMongo();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("SIGINT received: closing MongoDB connection");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received: closing MongoDB connection");
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = mongoose;
