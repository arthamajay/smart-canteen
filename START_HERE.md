# 🚀 START HERE - Quick Setup Guide

Welcome to the Smart Canteen Order & Payment Verification System!

## Current Status

✅ **Phase 6 Complete (85%)** - Authentication & Role-Based Access Control

The system now has:
- Student registration and login
- Vendor login and QR scanning
- Admin dashboard
- Order placement and history
- QR code generation and verification

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Setup Database (1 minute)

```bash
# Apply the authentication schema
psql -U postgres -d smart_canteen -f database/auth_schema.sql
```

### Step 2: Create Admin User (30 seconds)

```bash
cd backend
node setup-admin.js
```

**Admin Credentials:**
- Username: `admin`
- Password: `admin123`

### Step 3: Start Backend (30 seconds)

```bash
# In terminal 1
cd backend
npm run dev
```

Wait for: `✅ Connected to PostgreSQL database`

### Step 4: Start Frontend (30 seconds)

```bash
# In terminal 2
cd frontend
npm start
```

Wait for: `Compiled successfully!`

### Step 5: Open Browser (10 seconds)

Open: http://localhost:3000

You should see the login page!

---

## 🧪 Quick Test (2 Minutes)

### Test 1: Register as Student (1 minute)

1. Click "Register" button
2. Fill in:
   - Name: Test Student
   - Username: student1
   - Email: student1@college.edu
   - Password: password123
   - Confirm Password: password123
   - Phone: 9876543210
   - Year: 2nd Year
   - Branch: Computer Science
3. Click "Register"
4. Login with username: `student1`, password: `password123`

### Test 2: Place an Order (1 minute)

1. After login, you'll see the Student Dashboard
2. Click "Add to Cart" on any item
3. Adjust quantity if needed
4. Click "Place Order"
5. You'll see a QR code and Order ID!

### Test 3: Login as Admin (30 seconds)

1. Logout (top right)
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. You'll see the Admin Dashboard with statistics!

---

## 📱 User Roles

### 👨‍🎓 Student
- Register via UI
- Browse and order food
- View order history
- Get QR codes for pickup

**Access:** http://localhost:3000/student/dashboard

### 👨‍🍳 Vendor
- Login only (admin creates account)
- Scan QR codes
- Verify orders
- Mark as consumed

**Access:** http://localhost:3000/vendor/dashboard

**To create a vendor:** Run this SQL:
```sql
INSERT INTO users (name, email, phone, username, password_hash, role, is_active)
VALUES (
    'Vendor One',
    'vendor1@canteen.com',
    '9876543211',
    'vendor1',
    '$2b$10$YourBcryptHashHere',  -- Use admin's hash for testing
    'vendor',
    TRUE
);
```

### 🛡️ Admin
- Pre-created account
- View statistics
- Manage system (UI in progress)

**Access:** http://localhost:3000/admin/dashboard

---

## 🎯 What You Can Do Now

### As Student:
✅ Register and login
✅ Browse food items
✅ Add items to cart
✅ Place orders
✅ Get QR codes
✅ View order history
✅ Filter orders by status

### As Vendor:
✅ Login
✅ Scan QR codes (camera)
✅ Enter Order ID manually
✅ Verify orders
✅ View order details
✅ Mark as consumed

### As Admin:
✅ Login
✅ View dashboard statistics
✅ See total students, vendors, orders
✅ View today's performance
🔄 Manage vendors (UI placeholder)
🔄 Manage inventory (UI placeholder)
🔄 View analytics (UI placeholder)

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
pg_isready

# If not, start it (Windows: Services, Linux: systemctl)
```

### "Port 5000 already in use"
```bash
# Kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux:
lsof -ti:5000 | xargs kill -9
```

### "Blank page in browser"
1. Check browser console (F12)
2. Look for errors
3. Make sure both servers are running
4. Clear browser cache (Ctrl+Shift+Delete)

### "Login not working"
1. Check if admin user was created: `node setup-admin.js`
2. Check backend logs for errors
3. Verify JWT_SECRET is set in backend/.env

---

## 📚 Documentation

- **PHASE_6_COMPLETE.md** - Complete implementation details
- **SETUP_AND_TEST.md** - Detailed setup and testing guide
- **PHASE_6_PROGRESS.md** - Current progress status
- **API_DOCUMENTATION.md** - API reference
- **TROUBLESHOOTING.md** - Common issues and fixes

---

## 🎯 Next Steps

### For Testing:
1. ✅ Test student registration and login
2. ✅ Test order placement
3. ✅ Test order history
4. ✅ Test admin login
5. 🔄 Create vendor and test QR scanning

### For Development:
1. 🔄 Complete admin vendor management
2. 🔄 Complete admin inventory management
3. 🔄 Build analytics dashboard
4. 🔄 Add profile pages
5. 🔄 Implement real statistics API

---

## 💡 Tips

1. **Keep both terminals open** - One for backend, one for frontend
2. **Check browser console** - Press F12 to see errors
3. **Use admin account** - To create vendors and manage system
4. **Test on Chrome** - Best compatibility for QR scanner
5. **Use HTTPS in production** - Required for camera access

---

## 🆘 Need Help?

1. Check the browser console (F12)
2. Check backend terminal for errors
3. Read TROUBLESHOOTING.md
4. Check SETUP_AND_TEST.md for detailed instructions

---

## ✅ Checklist

Before you start:
- [ ] PostgreSQL is installed and running
- [ ] Node.js is installed (v14+)
- [ ] Database 'smart_canteen' exists
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)

After setup:
- [ ] Auth schema applied
- [ ] Admin user created
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login as admin
- [ ] Can register as student

---

**You're all set! Start testing the system! 🎉**

**Current Phase:** Phase 6 - Authentication (85% complete)
**Next Phase:** Phase 7 - Admin Management & Analytics
