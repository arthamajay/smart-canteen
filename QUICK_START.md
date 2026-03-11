# 🚀 Quick Start Guide

Complete guide to run the Smart Canteen application (Backend + Frontend).

---

## 📋 Prerequisites

1. **Node.js** (v14+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)

---

## 🗄️ Step 1: Database Setup

### Create Database
```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_canteen;

# Exit
\q
```

### Run Schema
```bash
# From project root
psql -U postgres -d smart_canteen -f database/schema.sql
```

### Insert Seed Data
```bash
psql -U postgres -d smart_canteen -f database/seed.sql
```

### Verify
```bash
psql -U postgres -d smart_canteen

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM items;
SELECT COUNT(*) FROM users;

# Exit
\q
```

---

## 🔧 Step 2: Backend Setup

### Navigate to Backend
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
Edit `backend/.env` with your PostgreSQL password:
```env
DB_PASSWORD=your_postgres_password
```

### Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
==================================================
🚀 Server running in development mode
📡 Listening on port 5000
🌐 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
==================================================
✅ Connected to PostgreSQL database
```

### Test Backend
Open new terminal:
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/items
```

---

## 🎨 Step 3: Frontend Setup

### Navigate to Frontend
```bash
# From project root
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Start Frontend
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view smart-canteen-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Browser will automatically open at `http://localhost:3000`

---

## 🧪 Step 4: Test the Application

### Student Flow

1. **Browse Items**
   - Click "Student" button
   - See all food items
   - Try category filters

2. **Add to Cart**
   - Click "Add to Cart" on any item
   - Use +/- buttons to adjust quantity
   - See cart update in real-time

3. **Place Order**
   - Click "Place Order" button
   - Wait for processing
   - See success message

4. **View QR Code**
   - Note your Order ID
   - See QR code generated
   - Read next steps

### Vendor Flow

1. **Switch to Vendor**
   - Click "Vendor" button

2. **Verify Order**
   - Enter Order ID from student (e.g., 2)
   - Click "Verify Order"
   - See order details

3. **Check Result**
   - Success: Order marked as CONSUMED
   - See items list
   - Click "Verify Another Order"

---

## 🎯 Test Scenarios

### Scenario 1: New Order (Happy Path)
```
Student:
1. Add 2 Samosas + 1 Tea to cart
2. Place order → Get Order ID (e.g., 4)
3. Payment auto-confirmed
4. QR code displayed

Vendor:
1. Enter Order ID: 4
2. Verify → Success
3. Order marked as CONSUMED
4. Stock deducted
```

### Scenario 2: Already Consumed Order
```
Vendor:
1. Enter Order ID: 1 (from seed data)
2. Verify → Error: "Order already consumed"
```

### Scenario 3: Unpaid Order
```
Vendor:
1. Enter Order ID: 3 (from seed data - CREATED status)
2. Verify → Error: "Order cannot be consumed. Current status: CREATED"
```

---

## 📊 Seed Data Reference

### Sample Orders (from seed.sql)

| Order ID | Status | User | Items | Amount |
|----------|--------|------|-------|--------|
| 1 | CONSUMED | Rahul | 2 Samosas, 1 Tea, 1 Spring Roll | ₹45 |
| 2 | PAID | Priya | 1 Veg Thali, 1 Coffee, 1 Gulab Jamun | ₹95 |
| 3 | CREATED | Amit | 2 Vada Pav, 1 Dosa | ₹70 |

**Use Order ID 2 for testing vendor verification (PAID status)**

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `ECONNREFUSED` or database connection error

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -U postgres -l | grep smart_canteen`
3. Check credentials in `backend/.env`
4. Ensure port 5000 is not in use

### Frontend Won't Start

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Items Not Loading

**Error:** Empty items list

**Solution:**
1. Check backend is running
2. Check seed data was inserted: `psql -U postgres -d smart_canteen -c "SELECT COUNT(*) FROM items;"`
3. Check browser console for errors
4. Verify API URL in `frontend/.env`

### CORS Error

**Error:** `Access-Control-Allow-Origin` error

**Solution:**
1. Check `FRONTEND_URL` in `backend/.env` is `http://localhost:3000`
2. Restart backend server
3. Clear browser cache

---

## 📁 Project Structure

```
smart-canteen/
├── backend/              # Node.js + Express API
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env             # Configure this!
│   ├── package.json
│   └── server.js
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── database/            # SQL files
│   ├── schema.sql       # Run first
│   └── seed.sql         # Run second
│
└── README.md
```

---

## 🔄 Development Workflow

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Keep running
```

### Terminal 2: Frontend
```bash
cd frontend
npm start
# Keep running
```

### Terminal 3: Database (optional)
```bash
psql -U postgres -d smart_canteen
# For manual queries
```

---

## 🎯 URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:5000/api | REST API |
| Health Check | http://localhost:5000/health | Server status |
| Items API | http://localhost:5000/api/items | Get items |

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `smart_canteen` created
- [ ] Schema applied successfully
- [ ] Seed data inserted
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Backend server running on port 5000
- [ ] Health check returns success
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 3000
- [ ] Can browse items
- [ ] Can add to cart
- [ ] Can place order
- [ ] Can see QR code
- [ ] Can verify order (vendor)

---

## 🎉 Success!

If all steps completed successfully:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Database connected
- ✅ Can place orders
- ✅ Can verify orders
- ✅ QR codes working

**You're ready to use the Smart Canteen system!**

---

## 📚 Next Steps

1. Explore the student interface
2. Test the vendor interface
3. Review the code structure
4. Read API documentation (`backend/API_DOCUMENTATION.md`)
5. Check frontend docs (`frontend/README.md`)
6. Proceed to Phase 4 (Inventory Logic)

---

## 💡 Tips

- Keep both backend and frontend running simultaneously
- Use browser DevTools to inspect API calls
- Check terminal logs for errors
- Use seed data Order IDs for testing
- Clear browser cache if issues occur

---

## 🆘 Need Help?

1. Check error messages in terminal
2. Review browser console
3. Verify all prerequisites installed
4. Check troubleshooting section
5. Review documentation files

---

**Happy Coding! 🚀**
