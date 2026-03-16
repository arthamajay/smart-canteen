require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT });
p.query("SELECT column_name FROM information_schema.columns WHERE table_name='users'").then(r => {
  console.log('users columns:', r.rows.map(x => x.column_name).join(', '));
  p.end();
});
