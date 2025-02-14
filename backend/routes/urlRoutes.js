const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');
const createUrlLimiter = require('../middleware/rateLimiter');
const verifyJWT = require('../middleware/verifyJWT');

// Protected endpoints (require authentication)
router.post('/shorten', verifyJWT, createUrlLimiter, urlController.createShortUrl);
router.get('/analytics/:alias', verifyJWT, urlController.getUrlAnalytics);
router.get('/analytics/topic/:topic', verifyJWT, urlController.getTopicAnalytics);
router.get('/analytics/overall', verifyJWT, urlController.getOverallAnalytics);

// Public endpoint for redirection (analytics logging is handled in the controller)
router.get('/shorten/:alias', urlController.redirectUrl);

module.exports = router;
