# 🔍 Quick Status Check

Run these commands to diagnose your issue:

## 1. Check if Frontend Compiled Successfully

Look at your frontend terminal. You should see:
```
Compiled successfully!

You can now view smart-canteen-frontend in the browser.

  Local:            http://localhost:3000
```

**If you see errors instead**, that's the problem. Share the error message.

## 2. Check Browser Console

1. Open Chrome
2. Go to http://localhost:3000
3. Press F12 (or Right-click → Inspect)
4. Click "Console" tab
5. Look for RED error messages

**Common errors and fixes:**

### "Failed to fetch" or "Network Error"
→ Backend is not running. Start it with:
```bash
cd backend
npm run dev
```

### "Unexpected token < in JSON"
→ Backend returned HTML instead of JSON. Check backend is running on port 5000.

### Blank console (no errors)
→ React app didn't load. Check frontend terminal for compilation errors.

## 3. Test Backend Directly

Open a new terminal and run:
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

**If it fails:**
- Backend is not running
- Start it: `cd backend && npm run dev`

## 4. Check What You See

When you open http://localhost:3000, what do you see?

### Option A: Completely Blank White Page
→ React app failed to compile. Check frontend terminal for errors.

### Option B: Browser Loading Forever
→ JavaScript error. Check browser console (F12).

### Option C: "Cannot GET /"
→ Frontend server not running. Start it: `cd frontend && npm start`

### Option D: Navigation bar but no content
→ Backend not running or database empty. Check backend terminal.

## 5. Quick Fix Steps

Try these in order:

### Step 1: Restart Frontend
```bash
# In frontend terminal, press Ctrl+C to stop
# Then run:
npm start
```

### Step 2: Clear Browser Cache
1. In Chrome, press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (F5)

### Step 3: Check Both Servers Running

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Should show: `✅ Connected to PostgreSQL database`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
Should show: `Compiled successfully!`

### Step 4: Open Fresh Browser Tab
- Close all tabs
- Open new tab
- Go to http://localhost:3000

## What Should You See?

When everything works, you should see:

1. **Top of page:** Purple gradient background
2. **Navigation bar:** White bar with "🍽️ Smart Canteen" and two buttons
3. **Main content:** "Student Portal - Order Food" title
4. **Menu items:** Grid of food items (Samosa, Tea, etc.)
5. **Right side:** Shopping cart section

## Still Not Working?

Tell me:
1. What do you see in the browser?
2. Any errors in browser console? (F12)
3. What does frontend terminal show?
4. What does backend terminal show?

I'll help you fix it! 🔧
