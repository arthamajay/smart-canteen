/**
 * migrate.js — Run this ONCE to set up the full Supabase schema.
 * Usage: node migrate.js
 *
 * Order:
 *  1. Base tables (users, items, orders, order_items, payments)
 *  2. Auth columns + enums + sessions + vendor_activity
 *  3. Inventory table
 *  4. Admin user
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration...\n');

    // ── 1. ENUMS ──────────────────────────────────────────────
    await client.query(`DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('student', 'vendor');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE order_status AS ENUM ('CREATED', 'PAID', 'CONSUMED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    // Add admin to enum if missing
    await client.query(`DO $$ BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    EXCEPTION WHEN others THEN NULL; END $$`);

    console.log('✅ Enums ready');

    // ── 2. USERS ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id       SERIAL PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(100) UNIQUE NOT NULL,
        phone         VARCHAR(15),
        role          user_role NOT NULL DEFAULT 'student',
        username      VARCHAR(50) UNIQUE,
        password_hash VARCHAR(255),
        year          VARCHAR(20),
        branch        VARCHAR(100),
        is_active     BOOLEAN DEFAULT TRUE,
        last_login    TIMESTAMP,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add columns if table already existed without them
    const authCols = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(20)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`,
    ];
    for (const sql of authCols) await client.query(sql);
    console.log('✅ Users table ready');

    // ── 3. ITEMS ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        item_id        SERIAL PRIMARY KEY,
        name           VARCHAR(100) NOT NULL,
        description    TEXT,
        price          DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        category       VARCHAR(50),
        is_available   BOOLEAN DEFAULT TRUE,
        image_url      VARCHAR(255),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Items table ready');

    // ── 4. ORDERS ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id     SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
        status       order_status NOT NULL DEFAULT 'CREATED',
        qr_code_data TEXT,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        consumed_at  TIMESTAMP
      )
    `);
    console.log('✅ Orders table ready');

    // ── 5. ORDER_ITEMS ────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        order_item_id  SERIAL PRIMARY KEY,
        order_id       INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        item_id        INTEGER NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
        quantity       INTEGER NOT NULL CHECK (quantity > 0),
        price_at_order DECIMAL(10,2) NOT NULL CHECK (price_at_order >= 0),
        subtotal       DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id, item_id)
      )
    `);
    console.log('✅ Order items table ready');

    // ── 6. PAYMENTS ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id       SERIAL PRIMARY KEY,
        order_id         INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_ref      VARCHAR(100) UNIQUE NOT NULL,
        amount           DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        status           payment_status NOT NULL DEFAULT 'PENDING',
        payment_method   VARCHAR(50) DEFAULT 'SIMULATED',
        transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id)
      )
    `);
    console.log('✅ Payments table ready');

    // ── 7. SESSIONS ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        token      VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sessions table ready');

    // ── 8. VENDOR_ACTIVITY ────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendor_activity (
        activity_id SERIAL PRIMARY KEY,
        vendor_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        order_id    INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        action      VARCHAR(50) NOT NULL,
        result      VARCHAR(20) NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Vendor activity table ready');

    // ── 9. INVENTORY ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        inventory_id       SERIAL PRIMARY KEY,
        item_id            INTEGER NOT NULL UNIQUE REFERENCES items(item_id) ON DELETE CASCADE,
        stock_quantity     INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        reserved_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
        available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
        low_stock_threshold INTEGER DEFAULT 10,
        last_restocked_at  TIMESTAMP,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_reserved_stock CHECK (reserved_quantity <= stock_quantity)
      )
    `);
    console.log('✅ Inventory table ready');

    // ── 10. INDEXES ───────────────────────────────────────────
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_username   ON users(username)`,
      `CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role)`,
      `CREATE INDEX IF NOT EXISTS idx_users_is_active  ON users(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_items_category   ON items(category)`,
      `CREATE INDEX IF NOT EXISTS idx_items_available  ON items(is_available)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_payments_order   ON payments(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_inventory_item   ON inventory(item_id)`,
    ];
    for (const sql of indexes) await client.query(sql);
    console.log('✅ Indexes ready');

    // ── 11. ADMIN USER ────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await client.query(`
      INSERT INTO users (name, email, phone, username, password_hash, role, is_active)
      VALUES ('System Admin', 'admin@canteen.com', '0000000000', 'admin', $1, 'admin', TRUE)
      ON CONFLICT (username) DO UPDATE SET password_hash = $1, is_active = TRUE
    `, [passwordHash]);
    console.log('✅ Admin user ready (username: admin, password: admin123)');

    // ── 12. SEED ITEMS (if empty) ─────────────────────────────
    const itemCount = await client.query('SELECT COUNT(*) FROM items');
    if (parseInt(itemCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO items (name, description, price, stock_quantity, category, is_available) VALUES
        ('Idli (2 pcs)',    'Steamed rice cakes',          20.00, 100, 'Breakfast',   TRUE),
        ('Dosa',            'Crispy rice crepe',           30.00, 100, 'Breakfast',   TRUE),
        ('Vada (2 pcs)',    'Crispy lentil donuts',        25.00, 100, 'Breakfast',   TRUE),
        ('Rice + Dal',      'Steamed rice with dal',       40.00, 100, 'Main Course', TRUE),
        ('Chapati (2 pcs)', 'Whole wheat flatbread',       20.00, 100, 'Main Course', TRUE),
        ('Veg Biryani',     'Fragrant vegetable biryani',  60.00, 100, 'Main Course', TRUE),
        ('Samosa (2 pcs)',  'Crispy potato-filled pastry', 20.00, 100, 'Snacks',      TRUE),
        ('Tea',             'Hot masala chai',             10.00, 200, 'Beverages',   TRUE),
        ('Coffee',          'Hot filter coffee',           15.00, 200, 'Beverages',   TRUE),
        ('Cold Drink',      'Chilled soft drink',          20.00, 150, 'Beverages',   TRUE)
      `);

      // Seed inventory for the new items
      await client.query(`
        INSERT INTO inventory (item_id, stock_quantity, low_stock_threshold)
        SELECT item_id, 100, 10 FROM items ON CONFLICT (item_id) DO NOTHING
      `);
      console.log('✅ Sample items + inventory seeded');
    } else {
      // Ensure inventory rows exist for any items missing them
      await client.query(`
        INSERT INTO inventory (item_id, stock_quantity, low_stock_threshold)
        SELECT item_id, 100, 10 FROM items ON CONFLICT (item_id) DO NOTHING
      `);
      console.log(`ℹ️  Items already exist (${itemCount.rows[0].count}), inventory synced`);
    }

    console.log('\n✅ Migration complete!\n');
    console.log('Admin login → username: admin  password: admin123');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
