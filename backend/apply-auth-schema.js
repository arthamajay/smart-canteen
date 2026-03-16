const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    // Add columns if they don't exist
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(20)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
    console.log('✅ Auth columns added to users table');

    // Add admin role to enum if not exists
    try {
      await pool.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin'`);
      console.log('✅ Admin role added to enum');
    } catch(e) { console.log('ℹ️  Role enum:', e.message); }

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sessions table ready');

    // Create vendor_activity table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_activity (
        activity_id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        result VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Vendor activity table ready');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)`);
    console.log('✅ Indexes created');

    console.log('\n✅ Auth schema applied successfully!');
    await pool.end();
  } catch(e) {
    console.error('❌ Error:', e.message);
    await pool.end();
    process.exit(1);
  }
}
run();
