const redis = require('redis');
require('dotenv').config();

// Create a Redis client with password from .env file
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,  // Redis host (e.g., redis-14804.crce182.ap-south-1-1.ec2.redns.redis-cloud.com)
    port: process.env.REDIS_PORT,  // Redis port (usually 6379)
  },
  password: process.env.REDIS_PWD  // Redis password from .env
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Failed to connect to Redis:', err));

module.exports = client;
