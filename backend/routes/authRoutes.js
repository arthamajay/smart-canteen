const express = require('express');
const router = express.Router();
const {
  registerStudent,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/register - Student registration
router.post('/register', registerStudent);

// POST /api/auth/login - Login for all roles
router.post('/login', login);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', verifyToken, getProfile);

// PUT /api/auth/profile - Update profile (protected)
router.put('/profile', verifyToken, updateProfile);

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
