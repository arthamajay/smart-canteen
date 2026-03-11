const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_canteen',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');

    // Hash the password
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('✅ Password hashed successfully');

    // Check if admin exists
    const checkResult = await pool.query(
      "SELECT user_id FROM users WHERE username = 'admin'"
    );

    if (checkResult.rows.length > 0) {
      // Update existing admin
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, is_active = TRUE 
         WHERE username = 'admin'`,
        [passwordHash]
      );
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin
      await pool.query(
        `INSERT INTO users (name, email, phone, username, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'System Admin',
          'admin@canteen.com',
          '0000000000',
          'admin',
          passwordHash,
          'admin',
          true
        ]
      );
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupAdmin();
