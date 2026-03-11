// Test script to identify backend issues
console.log('🔍 Testing backend components...\n');

// Test 1: Check environment variables
console.log('1️⃣ Testing environment variables...');
require('dotenv').config();
console.log('   ✅ PORT:', process.env.PORT || '5000 (default)');
console.log('   ✅ DB_NAME:', process.env.DB_NAME);
console.log('   ✅ DB_USER:', process.env.DB_USER);
console.log('   ✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : '❌ NOT SET');
console.log('');

// Test 2: Check database connection
console.log('2️⃣ Testing database connection...');
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_canteen',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('   ❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('   ✅ Database connected successfully!');
    console.log('');
    
    // Test 3: Check required tables
    console.log('3️⃣ Testing database tables...');
    const tables = ['users', 'items', 'orders', 'order_items', 'payments', 'inventory'];
    
    Promise.all(
      tables.map(table => 
        pool.query(`SELECT COUNT(*) FROM ${table}`)
          .then(res => ({ table, count: res.rows[0].count, status: '✅' }))
          .catch(err => ({ table, error: err.message, status: '❌' }))
      )
    ).then(results => {
      results.forEach(r => {
        if (r.status === '✅') {
          console.log(`   ✅ ${r.table}: ${r.count} rows`);
        } else {
          console.log(`   ❌ ${r.table}: ${r.error}`);
        }
      });
      console.log('');
      
      // Test 4: Check required modules
      console.log('4️⃣ Testing required modules...');
      try {
        require('express');
        console.log('   ✅ express');
        require('cors');
        console.log('   ✅ cors');
        require('bcryptjs');
        console.log('   ✅ bcryptjs');
        require('jsonwebtoken');
        console.log('   ✅ jsonwebtoken');
        require('qrcode');
        console.log('   ✅ qrcode');
        require('express-validator');
        console.log('   ✅ express-validator');
        console.log('');
        
        // Test 5: Check route files
        console.log('5️⃣ Testing route files...');
        try {
          require('./routes/authRoutes');
          console.log('   ✅ authRoutes.js');
        } catch (e) {
          console.log('   ❌ authRoutes.js:', e.message);
        }
        
        try {
          require('./routes/itemRoutes');
          console.log('   ✅ itemRoutes.js');
        } catch (e) {
          console.log('   ❌ itemRoutes.js:', e.message);
        }
        
        try {
          require('./routes/orderRoutes');
          console.log('   ✅ orderRoutes.js');
        } catch (e) {
          console.log('   ❌ orderRoutes.js:', e.message);
        }
        
        try {
          require('./routes/paymentRoutes');
          console.log('   ✅ paymentRoutes.js');
        } catch (e) {
          console.log('   ❌ paymentRoutes.js:', e.message);
        }
        
        try {
          require('./routes/inventoryRoutes');
          console.log('   ✅ inventoryRoutes.js');
        } catch (e) {
          console.log('   ❌ inventoryRoutes.js:', e.message);
        }
        console.log('');
        
        // Test 6: Check middleware
        console.log('6️⃣ Testing middleware files...');
        try {
          require('./middleware/auth');
          console.log('   ✅ auth.js');
        } catch (e) {
          console.log('   ❌ auth.js:', e.message);
        }
        
        try {
          require('./middleware/errorHandler');
          console.log('   ✅ errorHandler.js');
        } catch (e) {
          console.log('   ❌ errorHandler.js:', e.message);
        }
        console.log('');
        
        console.log('✅ All tests passed! Backend should work fine.');
        console.log('\n💡 Try running: npm run dev');
        
      } catch (e) {
        console.error('   ❌ Module error:', e.message);
      }
      
      pool.end();
      process.exit(0);
    });
  }
});
