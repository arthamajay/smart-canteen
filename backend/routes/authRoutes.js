const express = require('express');
const router = express.Router();
const {
  registerStudent,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginRateLimit } = require('../middleware/rateLimiter');

// POST /api/auth/register - Student registration (rate limited to prevent abuse)
router.post('/register', loginRateLimit, registerStudent);

// POST /api/auth/login - Login for all roles (rate limited to prevent brute force)
router.post('/login', loginRateLimit, login);

// POST /api/auth/logout - Logout (blacklists the current token)
router.post('/logout', verifyToken, logout);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', verifyToken, getProfile);

// PUT /api/auth/profile - Update profile (protected)
router.put('/profile', verifyToken, updateProfile);

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
