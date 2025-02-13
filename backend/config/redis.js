require('dotenv').config();

const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,  // REDIS_HOST should be in your .env file
    port: process.env.REDIS_PORT || 6379  // REDIS_PORT should be defined or default to 6379
  },
  password: process.env.REDIS_PWD  // Optional, only if you need a password
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Failed to connect to Redis:', err));

// Export the client directly to be used in other files
module.exports = client;
