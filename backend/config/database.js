const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (Supabase connection string) and individual vars
// Required for Supabase SSL — disable strict cert chain validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Force IPv4 to avoid ENETUNREACH on IPv6-only hosts
      family: 4,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      family: 4,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const getClient = async () => {
  const client = await pool.connect();
  const release = client.release.bind(client);
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  return client;
};

module.exports = { query, pool, getClient };
