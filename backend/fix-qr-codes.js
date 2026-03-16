// Regenerates and saves QR images for all PAID orders that have a plain order_id stored
require('dotenv').config();
const { Pool } = require('pg');
const { generateQRCode } = require('./utils/qrGenerator');

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST,
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT
});

async function fixQRCodes() {
  // Find orders where qr_code_data is a short string (order ID) not a data URL
  const { rows } = await pool.query(
    `SELECT order_id, qr_code_data FROM orders WHERE status IN ('PAID','CONSUMED') AND qr_code_data IS NOT NULL`
  );

  let fixed = 0;
  for (const row of rows) {
    // If it's already a data URL, skip
    if (row.qr_code_data && row.qr_code_data.startsWith('data:image')) continue;

    const qrImage = await generateQRCode(row.order_id.toString());
    await pool.query('UPDATE orders SET qr_code_data=$1 WHERE order_id=$2', [qrImage, row.order_id]);
    console.log(`✅ Fixed QR for order #${row.order_id}`);
    fixed++;
  }

  console.log(`\nDone. Fixed ${fixed} order(s).`);
  await pool.end();
}

fixQRCodes().catch(e => { console.error(e); process.exit(1); });
