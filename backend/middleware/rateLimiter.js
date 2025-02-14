// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user to 10 requests per windowMs
  message: 'Too many requests from this account, please try again later.',
  keyGenerator: (req, res) => {
    // If req.user exists and has an id, use it; otherwise use the IP address.
    if (req.user && req.user.id) {
      return req.user.id.toString();
    }
    return req.ip;
  }
});

module.exports = createUrlLimiter;
