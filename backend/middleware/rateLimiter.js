// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createUrlLimiter = rateLimit({
  // 15-minute window
  windowMs: 15 * 60 * 1000,
  // Limit each user to 10 requests per window
  max: 10,
  // Customize the response message
  message: 'Too many short URLs created from this account, please try again later.',
  // Optionally, you can customize key generation to use user ID if available.
  keyGenerator: (req, res) => {
    // Use the authenticated user's ID if available; otherwise, use the IP address.
    return req.user ? req.user._id.toString() : req.ip;
  }
});

module.exports = createUrlLimiter;
