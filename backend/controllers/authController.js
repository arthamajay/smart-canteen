const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

// Student Registration
const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      username,
      email,
      password,
      confirm_password,
      phone,
      year,
      branch
    } = req.body;

    // Validation
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!username || username.trim().length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (password !== confirm_password) {
      errors.push('Passwords do not match');
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      errors.push('Valid 10-digit phone number is required');
    }

    if (!year) {
      errors.push('Year is required');
    }

    if (!branch) {
      errors.push('Branch is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: errors.join('; ') }
      });
    }

    // Check if username or email already exists
    const checkQuery = `
      SELECT user_id FROM users 
      WHERE username = $1 OR email = $2
    `;
    
    const existing = await db.query(checkQuery, [username, email]);
    
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'Username or email already exists' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const insertQuery = `
      INSERT INTO users (
        name, username, email, password_hash, phone, year, branch, role, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', TRUE)
      RETURNING user_id, name, username, email, phone, year, branch, role, created_at
    `;

    const result = await db.query(insertQuery, [
      name,
      username,
      email,
      password_hash,
      phone,
      year,
      branch
    ]);

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          year: user.year,
          branch: user.branch,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login (for all roles)
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' }
      });
    }

    // Find user
    const query = `
      SELECT 
        user_id, name, username, email, password_hash, phone, 
        year, branch, role, is_active
      FROM users
      WHERE username = $1
    `;
    
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid username or password' }
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: { message: 'Account is inactive. Please contact admin.' }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid username or password' }
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate token
    const token = generateToken(user);

    // Remove password_hash from response
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        user_id, name, username, email, phone, year, branch, 
        role, is_active, created_at, last_login
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [req.user.user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, year, branch } = req.body;
    const userId = req.user.user_id;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (year) {
      updates.push(`year = $${paramCount++}`);
      values.push(year);
    }

    if (branch) {
      updates.push(`branch = $${paramCount++}`);
      values.push(branch);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No fields to update' }
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, name, username, email, phone, year, branch, role
    `;

    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user.user_id;

    // Validation
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: { message: 'All password fields are required' }
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password must be at least 6 characters' }
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: { message: 'New passwords do not match' }
      });
    }

    // Get current password hash
    const query = 'SELECT password_hash FROM users WHERE user_id = $1';
    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, result.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  login,
  getProfile,
  updateProfile,
  changePassword
};
