const { createClient } = require("redis");

let client = null;

async function getRedisClient() {
  if (client) return client;
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  client = createClient({ url });
  client.on("error", (err) => console.error("Redis error", err));
  await client.connect();
  return client;
}

module.exports = { getRedisClient };