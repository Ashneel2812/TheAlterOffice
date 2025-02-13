const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');
const createUrlLimiter = require('../middleware/rateLimiter');

// Protected endpoints (require authentication)
router.post('/shorten', authMiddleware, createUrlLimiter, urlController.createShortUrl);
router.get('/analytics/:alias', authMiddleware, urlController.getUrlAnalytics);
router.get('/analytics/topic/:topic', authMiddleware, urlController.getTopicAnalytics);
router.get('/analytics/overall', authMiddleware, urlController.getOverallAnalytics);

// Public endpoint for redirection (analytics logging is handled in the controller)
router.get('/shorten/:alias', urlController.redirectUrl);

module.exports = router;
