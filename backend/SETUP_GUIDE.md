# 🚀 Backend Setup Guide

Complete guide to set up and run the Smart Canteen backend server.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js** (v14 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **PostgreSQL** (v12 or higher)
   - Check: `psql --version`
   - Download: https://www.postgresql.org/download/

3. **npm** (comes with Node.js)
   - Check: `npm --version`

---

## 🗄️ Database Setup

### Step 1: Create Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE smart_canteen;
```

### Step 2: Connect to Database

```bash
psql -U postgres -d smart_canteen
```

### Step 3: Run Schema

From the project root directory:

```bash
psql -U postgres -d smart_canteen -f database/schema.sql
```

Or copy-paste the contents of `database/schema.sql` into psql.

### Step 4: Insert Seed Data (Optional)

```bash
psql -U postgres -d smart_canteen -f database/seed.sql
```

This will populate the database with:
- 5 users (4 students, 1 vendor)
- 19 food items across 4 categories
- 3 sample orders for testing

### Step 5: Verify Database

```sql
-- Check tables
\dt

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM items;
SELECT COUNT(*) FROM orders;
```

---

## ⚙️ Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `pg` - PostgreSQL client
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing
- `qrcode` - QR code generation
- `nodemon` - Auto-restart server (dev)

### Step 3: Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_canteen
DB_USER=postgres
DB_PASSWORD=your_password_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password.

### Step 4: Test Database Connection

Create a test file `test-db.js`:

```javascript
require('dotenv').config();
const { pool } = require('./config/database');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
  pool.end();
});
```

Run:
```bash
node test-db.js
```

---

## 🏃 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Expected Output

```
==================================================
🚀 Server running in development mode
📡 Listening on port 5000
🌐 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
==================================================
✅ Connected to PostgreSQL database
```

---

## 🧪 Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-04T10:00:00.000Z"
}
```

### 2. Get All Items

```bash
curl http://localhost:5000/api/items
```

### 3. Create Order

```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {"item_id": 1, "quantity": 2},
      {"item_id": 6, "quantity": 1}
    ]
  }'
```

### 4. Confirm Payment

```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{"order_id": 4}'
```

### 5. Verify Order

```bash
curl -X POST http://localhost:5000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{"order_id": 2}'
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── controllers/
│   ├── itemController.js    # Item business logic
│   ├── orderController.js   # Order business logic
│   └── paymentController.js # Payment business logic
├── middleware/
│   └── errorHandler.js      # Error handling
├── models/
│   ├── Item.js              # Item model
│   ├── Order.js             # Order model
│   ├── Payment.js           # Payment model
│   └── User.js              # User model
├── routes/
│   ├── itemRoutes.js        # Item routes
│   ├── orderRoutes.js       # Order routes
│   └── paymentRoutes.js     # Payment routes
├── utils/
│   ├── qrGenerator.js       # QR code utility
│   └── validators.js        # Validation helpers
├── .env                      # Environment variables
├── .env.example              # Example env file
├── package.json              # Dependencies
└── server.js                 # Main entry point
```

---

## 🔍 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get item by ID |
| POST | /api/orders/create | Create order |
| GET | /api/orders/:id | Get order by ID |
| POST | /api/orders/verify | Verify order (vendor) |
| POST | /api/payments/confirm | Confirm payment |
| GET | /api/payments/order/:order_id | Get payment details |

See `API_DOCUMENTATION.md` for detailed API documentation.

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `connection refused`

**Solution:**
1. Check if PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Check PostgreSQL is listening on port 5432

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change PORT in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   ```

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Schema Error

**Error:** `relation "orders" does not exist`

**Solution:**
Re-run the schema:
```bash
psql -U postgres -d smart_canteen -f database/schema.sql
```

---

## 📊 Database Management

### View All Tables

```sql
\dt
```

### View Table Structure

```sql
\d orders
```

### Clear All Data

```sql
TRUNCATE TABLE order_items, payments, orders, items, users RESTART IDENTITY CASCADE;
```

### Backup Database

```bash
pg_dump -U postgres smart_canteen > backup.sql
```

### Restore Database

```bash
psql -U postgres smart_canteen < backup.sql
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | smart_canteen |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `smart_canteen` created
- [ ] Schema applied successfully
- [ ] Seed data inserted (optional)
- [ ] Node.js and npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] Can fetch items from API
- [ ] Can create orders
- [ ] Can confirm payments
- [ ] Can verify orders

---

## 🎯 Next Steps

Once backend is running:
1. Test all API endpoints
2. Verify order status flow
3. Check QR code generation
4. Test error handling
5. Proceed to Phase 3 (Frontend)

---

## 📚 Additional Resources

- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Node-postgres: https://node-postgres.com/
- QRCode: https://www.npmjs.com/package/qrcode

---

**Phase 2 Complete!** Backend is ready for frontend integration.
