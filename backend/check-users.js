const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT });
pool.query('SELECT username, role, is_active FROM users ORDER BY role').then(r => {
  console.log('Users in DB:');
  r.rows.forEach(u => console.log(' ', u.role.padEnd(8), u.username, u.is_active ? '(active)' : '(inactive)'));
  pool.end();
});
