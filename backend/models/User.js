const db = require('../config/database');

class User {
  // Create new user
  static async create(name, email, phone, role = 'student') {
    const query = `
      INSERT INTO users (name, email, phone, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, name, email, phone, role, created_at
    `;
    
    const result = await db.query(query, [name, email, phone, role]);
    return result.rows[0];
  }

  // Get user by ID
  static async getById(userId) {
    const query = `
      SELECT user_id, name, email, phone, role, created_at, updated_at
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  // Get user by email
  static async getByEmail(email) {
    const query = `
      SELECT user_id, name, email, phone, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Get all users by role
  static async getByRole(role) {
    const query = `
      SELECT user_id, name, email, phone, role, created_at
      FROM users
      WHERE role = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [role]);
    return result.rows;
  }
}

module.exports = User;
