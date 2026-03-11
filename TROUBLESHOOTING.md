# 🔧 Troubleshooting Guide

Common issues and solutions for the Smart Canteen application.

---

## ❌ Issue: Blank Page at localhost:3000

### Problem
When opening http://localhost:3000, you see a blank page or the page doesn't load.

### Solutions

#### 1. Check Browser Console
1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Go to Console tab
3. Look for any error messages

**Common Errors:**
- "Failed to fetch" → Backend not running
- "Module not found" → Missing dependencies
- "Unexpected token" → Syntax error in code

#### 2. Verify Frontend is Running
Check your terminal where you ran `npm start`:

**Should see:**
```
Compiled successfully!

You can now view smart-canteen-frontend in the browser.

  Local:            http://localhost:3000
```

**If you see errors:**
```bash
# Stop the server (Ctrl+C)
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### 3. Check Backend is Running
The frontend needs the backend API to work.

**Verify backend terminal shows:**
```
==================================================
🚀 Server running in development mode
📡 Listening on port 5000
==================================================
✅ Connected to PostgreSQL database
```

**Test backend:**
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/items
```

#### 4. Clear Browser Cache
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or:
- Chrome: Ctrl+Shift+Delete → Clear browsing data
- Select "Cached images and files"
- Click "Clear data"

#### 5. Check Port Conflicts
**Frontend port 3000 in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Then restart: `npm start`

---

## ❌ Issue: "There is no login page"

### Explanation
This is an MVP (Minimum Viable Product) without authentication. There is NO login page by design.

### What You Should See

When you open http://localhost:3000, you should see:

1. **Navigation Bar** at the top with:
   - "🍽️ Smart Canteen" title
   - Two buttons: "👨‍🎓 Student" and "👨‍🍳 Vendor"

2. **Student Page** (default view):
   - "Student Portal - Order Food" title
   - Menu items with categories
   - Shopping cart on the right

### If You Don't See This
Follow the troubleshooting steps above.

---

## ❌ Issue: Items Not Loading

### Problem
The page loads but no food items appear.

### Solutions

#### 1. Check Backend Connection
Open browser console (F12) and look for:
- "Network Error"
- "Failed to fetch"
- CORS errors

#### 2. Verify Backend is Running
```bash
curl http://localhost:5000/api/items
```

Should return JSON with items.

#### 3. Check Database Has Data
```bash
psql -U postgres -d smart_canteen

SELECT COUNT(*) FROM items;
# Should return 19

\q
```

**If no data:**
```bash
psql -U postgres -d smart_canteen -f database/seed.sql
```

#### 4. Check CORS Configuration
In `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

In `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Restart both servers after changing .env files.

---

## ❌ Issue: "Cannot POST /api/orders/create"

### Problem
Error when trying to place an order.

### Solutions

#### 1. Check Backend Routes
Verify backend terminal shows the request:
```
API Request: POST /api/orders/create
```

#### 2. Check Request Body
Open browser DevTools → Network tab
- Click on the failed request
- Check "Payload" or "Request" tab
- Verify JSON format is correct

#### 3. Check User ID
The app uses hardcoded `user_id = 1`. Verify this user exists:
```sql
psql -U postgres -d smart_canteen

SELECT * FROM users WHERE user_id = 1;
```

**If no user:**
```sql
INSERT INTO users (name, email, phone, role) 
VALUES ('Test Student', 'test@college.edu', '1234567890', 'student');
```

---

## ❌ Issue: QR Code Not Displaying

### Problem
Order placed successfully but QR code doesn't show.

### Solutions

#### 1. Check Payment Response
Open browser console and look for the API response.

Should contain:
```json
{
  "qr_code": "data:image/png;base64,iVBORw0KG..."
}
```

#### 2. Check Backend QR Generation
Backend terminal should show:
```
Executed query { text: 'UPDATE orders...', duration: X, rows: 1 }
```

#### 3. Verify qrcode Package
```bash
cd backend
npm list qrcode
```

Should show: `qrcode@1.5.3`

**If missing:**
```bash
npm install qrcode
```

---

## ❌ Issue: Database Connection Failed

### Problem
Backend shows: `❌ Unexpected error on idle client`

### Solutions

#### 1. Check PostgreSQL is Running
```bash
# Windows
pg_isready

# Or check services
services.msc
# Look for "postgresql" service
```

#### 2. Verify Database Exists
```bash
psql -U postgres -l | grep smart_canteen
```

**If not found:**
```bash
psql -U postgres
CREATE DATABASE smart_canteen;
\q

psql -U postgres -d smart_canteen -f database/schema.sql
psql -U postgres -d smart_canteen -f database/seed.sql
```

#### 3. Check Credentials
In `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_canteen
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

#### 4. Test Connection
```bash
psql -U postgres -d smart_canteen
```

If this works, your credentials are correct.

---

## ❌ Issue: Module Not Found

### Problem
Error: `Cannot find module 'express'` or similar

### Solutions

#### Backend
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Issue: Port Already in Use

### Problem
`Error: listen EADDRINUSE: address already in use :::5000`

### Solutions

#### Kill Process on Port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

#### Or Change Port
In `backend/.env`:
```env
PORT=5001
```

In `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

---

## ❌ Issue: CORS Error

### Problem
Browser console shows: `Access to fetch at 'http://localhost:5000/api/items' from origin 'http://localhost:3000' has been blocked by CORS policy`

### Solutions

#### 1. Check Backend CORS Config
In `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

#### 2. Restart Backend
After changing .env, restart the backend server:
```bash
# Stop with Ctrl+C
npm run dev
```

#### 3. Verify CORS Middleware
Backend should show on startup:
```
✅ Connected to PostgreSQL database
```

---

## ❌ Issue: Blank White Screen

### Problem
Page loads but shows only white screen, no errors in console.

### Solutions

#### 1. Check React App Compiled
Frontend terminal should show:
```
Compiled successfully!
```

**If compilation errors:**
- Read the error message
- Fix the syntax error
- Save the file
- React will auto-reload

#### 2. Check Browser Compatibility
Use latest version of:
- Chrome
- Firefox
- Edge

#### 3. Disable Browser Extensions
Some extensions block React apps:
- Open in Incognito/Private mode
- Or disable extensions temporarily

---

## ✅ Quick Diagnostic Checklist

Run through this checklist:

### Backend
- [ ] PostgreSQL is running
- [ ] Database `smart_canteen` exists
- [ ] Schema applied (tables exist)
- [ ] Seed data loaded (items exist)
- [ ] Backend dependencies installed (`node_modules` exists)
- [ ] `.env` file configured correctly
- [ ] Backend running on port 5000
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Items API works: `curl http://localhost:5000/api/items`

### Frontend
- [ ] Frontend dependencies installed (`node_modules` exists)
- [ ] `.env` file exists with correct API URL
- [ ] Frontend running on port 3000
- [ ] Browser shows "Compiled successfully!"
- [ ] No errors in browser console (F12)
- [ ] Can see navigation bar
- [ ] Can see "Student Portal" or "Vendor Portal"

### Network
- [ ] Backend and frontend on same network
- [ ] No firewall blocking ports 3000 or 5000
- [ ] CORS configured correctly

---

## 🆘 Still Having Issues?

### 1. Check All Logs
- Backend terminal output
- Frontend terminal output
- Browser console (F12)
- Network tab in DevTools

### 2. Restart Everything
```bash
# Stop both servers (Ctrl+C in both terminals)

# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### 3. Fresh Start
```bash
# Stop all servers

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### 4. Verify Setup
Follow **QUICK_START.md** step by step from the beginning.

---

## 📞 Getting Help

When asking for help, provide:

1. **Error Message** (exact text)
2. **Terminal Output** (backend and frontend)
3. **Browser Console** (F12 → Console tab)
4. **What You Tried** (steps you already took)
5. **Environment**:
   - OS (Windows/Mac/Linux)
   - Node version: `node --version`
   - PostgreSQL version: `psql --version`
   - Browser (Chrome/Firefox/etc.)

---

## 💡 Pro Tips

1. **Always check both terminals** - backend and frontend
2. **Use browser DevTools** - F12 is your friend
3. **Read error messages carefully** - they usually tell you what's wrong
4. **Restart after .env changes** - environment variables need restart
5. **Clear cache when in doubt** - Ctrl+Shift+Delete in Chrome
6. **Check database first** - many issues are database-related
7. **One change at a time** - easier to identify what fixed it

---

**Most issues are solved by restarting the servers and clearing browser cache!** 🎯
