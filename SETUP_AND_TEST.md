# 🚀 Complete Setup and Testing Guide

## Current Status: Phase 6 - Authentication System (90% Complete)

### ✅ What's Already Built

1. **Backend Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Role-based access control (student, vendor, admin)
   - Auth middleware for protected routes

2. **Frontend Components**
   - Login page
   - Registration page (students only)
   - Student Dashboard with order placement
   - Order History page
   - Vendor Dashboard with QR scanning
   - QR Scanner component
   - Private route protection

3. **Database Schema**
   - Extended users table with auth fields
   - Sessions table for token management
   - Vendor activity tracking
   - Student order history view

### 📦 Dependencies Status

All required dependencies are installed:
- Backend: bcryptjs, jsonwebtoken, express-validator ✅
- Frontend: react-qr-reader, react-toastify, react-icons ✅

---

## 🔧 Setup Instructions

### Step 1: Apply Database Schema

Run the authentication schema to add auth fields:

```bash
psql -U postgres -d smart_canteen -f database/auth_schema.sql
```

**Expected output:**
```
ALTER TABLE
ALTER TABLE
CREATE INDEX
INSERT 0 1
COMMIT
```

### Step 2: Create Admin User

The admin user needs a proper password hash. Run this SQL:

```sql
-- Connect to database
psql -U postgres -d smart_canteen

-- Update admin password (password: admin123)
UPDATE users 
SET password_hash = '$2b$10$YourActualBcryptHashHere'
WHERE username = 'admin';
```

Or use the backend to create admin via API (recommended).

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
==================================================
🚀 Server running in development mode
📡 Listening on port 5000
🌐 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
==================================================
```

### Step 4: Start Frontend Server

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view smart-canteen-frontend in the browser.

  Local:            http://localhost:3000
```

---

## 🧪 Testing Guide

### Test 1: Student Registration

1. Open http://localhost:3000
2. Click "Register" button
3. Fill in the form:
   - Name: Test Student
   - Username: student1
   - Email: student1@college.edu
   - Password: password123
   - Confirm Password: password123
   - Phone: 9876543210
   - Year: 2nd Year
   - Branch: Computer Science
4. Click "Register"

**Expected:** Redirect to login page with success message

### Test 2: Student Login

1. Go to http://localhost:3000/login
2. Enter credentials:
   - Username: student1
   - Password: password123
3. Click "Login"

**Expected:** Redirect to /student/dashboard

### Test 3: Place Order (Student)

1. After login, you should see the Student Dashboard
2. Browse available items
3. Click "Add to Cart" on items
4. Review cart on the right side
5. Click "Place Order"

**Expected:** 
- Order created successfully
- Payment confirmed
- QR code displayed
- Order ID shown

### Test 4: View Order History (Student)

1. From Student Dashboard, click "Order History"
2. View list of previous orders

**Expected:**
- List of all orders with status
- Order details (items, amount, date)
- Filter by status (All, Ready for Pickup, Completed)

### Test 5: Vendor Login

First, create a vendor user via SQL:

```sql
INSERT INTO users (name, email, phone, username, password_hash, role, is_active)
VALUES (
    'Vendor One',
    'vendor1@canteen.com',
    '9876543211',
    'vendor1',
    '$2b$10$YourBcryptHashHere', -- Use same hash as admin for testing
    'vendor',
    TRUE
);
```

Then:
1. Go to http://localhost:3000/login
2. Enter vendor credentials
3. Click "Login"

**Expected:** Redirect to /vendor/dashboard

### Test 6: Scan QR Code (Vendor)

1. From Vendor Dashboard, click "Open Scanner"
2. Allow camera permissions
3. Scan a student's QR code

**Expected:**
- Order details displayed
- Items list shown
- Verify button available

### Test 7: Manual Order Verification (Vendor)

1. From Vendor Dashboard
2. Enter Order ID manually
3. Click "Verify Order"

**Expected:**
- Order status shown
- Items displayed
- Success/failure message

---

## 🐛 Common Issues and Fixes

### Issue 1: "Cannot connect to database"

**Fix:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
# Windows: Start PostgreSQL service from Services
# Linux: sudo systemctl start postgresql
```

### Issue 2: "JWT token invalid"

**Fix:**
- Check if JWT_SECRET is set in backend/.env
- Clear browser localStorage
- Login again

### Issue 3: "Camera not working in QR Scanner"

**Fix:**
- Use HTTPS (camera requires secure context)
- Check browser permissions
- Try different browser (Chrome recommended)

### Issue 4: "Registration fails"

**Fix:**
- Check if username/email already exists
- Verify all required fields are filled
- Check backend console for errors

### Issue 5: "Order creation fails"

**Fix:**
- Check if items have stock available
- Verify inventory table has data
- Check backend logs for errors

---

## 🔍 API Testing with cURL

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "username": "student2",
    "email": "student2@college.edu",
    "password": "password123",
    "phone": "9876543212",
    "year": "3rd Year",
    "branch": "Electronics"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

### Test Protected Route (Order History)
```bash
# Replace YOUR_TOKEN with actual JWT token from login
curl -X GET http://localhost:5000/api/orders/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Verification

### Check Users
```sql
SELECT user_id, name, username, email, role, is_active 
FROM users;
```

### Check Orders
```sql
SELECT o.order_id, u.name, o.total_amount, o.status, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Check Order History View
```sql
SELECT * FROM student_order_history LIMIT 5;
```

---

## 🎯 What's Next: Admin Dashboard

The final major component to build is the Admin Dashboard with:

1. **Vendor Management**
   - Add new vendors
   - Edit vendor details
   - Deactivate vendors
   - View vendor activity

2. **Inventory Management**
   - Add new items
   - Update stock levels
   - Set prices
   - Manage availability

3. **Analytics Dashboard**
   - Daily sales reports
   - Popular items
   - Peak hours
   - Revenue tracking

4. **User Management**
   - View all students
   - View all vendors
   - Deactivate users
   - Reset passwords

Would you like me to proceed with building the Admin Dashboard?

---

## 📝 Quick Commands Reference

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Apply database schema
psql -U postgres -d smart_canteen -f database/auth_schema.sql

# Check database
psql -U postgres -d smart_canteen

# View backend logs
# Check terminal where backend is running

# View frontend logs
# Check browser console (F12)
```

---

## ✅ Checklist Before Testing

- [ ] PostgreSQL is running
- [ ] Database 'smart_canteen' exists
- [ ] Auth schema applied
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] At least one admin user exists
- [ ] Sample items in database
- [ ] Browser console open for debugging

---

**Current Phase:** Phase 6 - Authentication (90% complete)
**Next Phase:** Phase 7 - Admin Dashboard & Management
**Status:** Ready for testing and admin dashboard implementation
