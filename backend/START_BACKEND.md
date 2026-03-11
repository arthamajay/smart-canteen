# 🚀 Backend Start Guide

## ✅ All Issues Fixed!

The backend is now ready to run. All tests passed:
- ✅ Database connection working
- ✅ All tables exist (including inventory)
- ✅ All modules installed
- ✅ All routes working
- ✅ All middleware working

---

## 🏃 Start the Backend

### Option 1: Development Mode (Recommended)
```bash
npm run dev
```

This will start the server with nodemon (auto-restart on file changes).

### Option 2: Production Mode
```bash
npm start
```

This will start the server with node (no auto-restart).

---

## ✅ Expected Output

When the backend starts successfully, you should see:

```
==================================================
🚀 Server running in development mode
📡 Listening on port 5000
🌐 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
==================================================
```

---

## 🧪 Test the Backend

### Test 1: Health Check
Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-11T..."
}
```

### Test 2: Get Items
```bash
curl http://localhost:5000/api/items
```

Should return a list of food items.

### Test 3: Login (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Should return a JWT token.

---

## 🐛 If You See Errors

### Error: "Port 5000 already in use"
```bash
# Windows - Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change the port in .env file
PORT=5001
```

### Error: "Cannot connect to database"
1. Make sure PostgreSQL is running
2. Check credentials in `.env` file
3. Test connection: `node test-server.js`

### Error: "Module not found"
```bash
npm install
```

---

## 📊 Backend Status

- **Port:** 5000
- **Database:** smart_canteen
- **Tables:** 8 (users, items, orders, order_items, payments, inventory, sessions, vendor_activity)
- **API Endpoints:** 14
- **Authentication:** JWT (24h expiration)

---

## 🔧 Useful Scripts

```bash
# Test all backend components
node test-server.js

# Create/update admin user
node setup-admin.js

# Create inventory table (already done)
node create-inventory-table.js

# Start development server
npm run dev

# Start production server
npm start
```

---

## 📝 API Endpoints Available

### Authentication
- POST /api/auth/register - Student registration
- POST /api/auth/login - Login (all roles)
- GET /api/auth/profile - Get profile (protected)
- PUT /api/auth/profile - Update profile (protected)
- POST /api/auth/change-password - Change password (protected)

### Items
- GET /api/items - Get all items
- GET /api/items/:id - Get item by ID

### Orders
- POST /api/orders/create - Create order (protected)
- GET /api/orders/history - Get order history (protected)
- GET /api/orders/:id - Get order by ID
- POST /api/orders/verify - Verify order (vendor)

### Payments
- POST /api/payments/confirm - Confirm payment

### Inventory
- GET /api/inventory - Get inventory
- PUT /api/inventory/:id - Update stock

---

## ✅ Ready to Start!

Everything is configured and tested. Just run:

```bash
npm run dev
```

Then open the frontend and start testing! 🎉

---

**Issues Fixed:**
1. ✅ Missing inventory table - Created
2. ✅ Order controller initialization error - Fixed
3. ✅ All dependencies verified
4. ✅ Database connection tested
5. ✅ All routes working

**Backend Status:** 100% Ready ✅
