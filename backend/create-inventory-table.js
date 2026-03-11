const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_canteen',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createInventoryTable() {
  try {
    console.log('🔧 Creating inventory table...\n');

    // Create inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        inventory_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL UNIQUE REFERENCES items(item_id) ON DELETE CASCADE,
        stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
        available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
        low_stock_threshold INTEGER DEFAULT 10,
        last_restocked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_reserved_stock CHECK (reserved_quantity <= stock_quantity)
      )
    `);
    console.log('✅ Inventory table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(item_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity)
    `);
    console.log('✅ Indexes created');

    // Insert initial inventory for existing items
    const result = await pool.query(`
      INSERT INTO inventory (item_id, stock_quantity, low_stock_threshold)
      SELECT 
        item_id,
        100 as stock_quantity,
        10 as low_stock_threshold
      FROM items
      ON CONFLICT (item_id) DO NOTHING
      RETURNING *
    `);
    console.log(`✅ Inserted inventory for ${result.rowCount} items`);

    // Create update timestamp function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_inventory_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Timestamp function created');

    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_inventory_timestamp ON inventory
    `);
    await pool.query(`
      CREATE TRIGGER trigger_update_inventory_timestamp
        BEFORE UPDATE ON inventory
        FOR EACH ROW
        EXECUTE FUNCTION update_inventory_timestamp()
    `);
    console.log('✅ Trigger created');

    // Verify
    const checkResult = await pool.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n✅ Inventory table ready with ${checkResult.rows[0].count} items\n`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createInventoryTable();
