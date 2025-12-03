const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Auth routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Profile route (protected)
router.get('/user/profile', auth, getProfile);

module.exports = router;


