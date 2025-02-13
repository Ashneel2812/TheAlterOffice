// config/redis.js
const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  },
  password: process.env.REDIS_PWD
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Failed to connect to Redis:', err));

// Export the client directly
module.exports = client;
