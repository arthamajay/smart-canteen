# 🔐 PHASE 6: Authentication & Role-Based Access - Implementation Plan

## ✅ Completed (Backend Authentication)

### 1. Database Schema
- ✅ Added authentication fields to users table (username, password_hash, year, branch)
- ✅ Created sessions table for token management
- ✅ Created vendor_activity table for tracking scans
- ✅ Created student_order_history view
- ✅ Added admin role to user_role enum

### 2. Authentication System
- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Token generation and verification
- ✅ Role-based access control middleware

### 3. API Endpoints Created
- ✅ POST /api/auth/register - Student registration
- ✅ POST /api/auth/login - Login for all roles
- ✅ GET /api/auth/profile - Get user profile (protected)
- ✅ PUT /api/auth/profile - Update profile (protected)
- ✅ POST /api/auth/change-password - Change password (protected)

### 4. Files Created
- ✅ database/auth_schema.sql
- ✅ backend/middleware/auth.js
- ✅ backend/controllers/authController.js
- ✅ backend/routes/authRoutes.js
- ✅ Updated backend/package.json (added bcryptjs, jsonwebtoken, express-validator)
- ✅ Updated backend/server.js
- ✅ Updated backend/.env

---

## 🔜 Next Steps (Frontend)

### 1. Authentication Pages
- [ ] Login page (all roles)
- [ ] Student registration page
- [ ] Forgot password page

### 2. Student Interface
- [ ] Student dashboard
- [ ] Browse items (existing, enhanced)
- [ ] Shopping cart (existing, enhanced)
- [ ] Order history page
- [ ] Profile page
- [ ] Change password page

### 3. Vendor Interface
- [ ] Vendor dashboard
- [ ] QR code scanner component
- [ ] Order verification with camera
- [ ] Scan history
- [ ] Profile page

### 4. Admin Interface
- [ ] Admin dashboard
- [ ] Manage vendors (add/edit/deactivate)
- [ ] Manage inventory
- [ ] View analytics
- [ ] User management
- [ ] System settings

### 5. Additional Features
- [ ] QR code scanning with camera
- [ ] Order history with filters
- [ ] Real-time notifications
- [ ] Profile management
- [ ] Password reset
- [ ] Session management

---

## 📋 Student Registration Fields

**Required Fields:**
- Name (min 2 characters)
- Username (min 3 characters, unique)
- Email (valid email format, unique)
- Password (min 6 characters)
- Confirm Password (must match)
- Phone Number (10 digits)
- Year (dropdown: 1st Year, 2nd Year, 3rd Year, 4th Year)
- Branch (dropdown: CSE, ECE, EEE, MECH, CIVIL, etc.)

**Optional Fields (can be added):**
- Roll Number
- Section
- Hostel/Day Scholar
- Profile Picture

---

## 🔐 Authentication Flow

### Student Registration Flow
```
1. Student fills registration form
2. Frontend validates input
3. POST /api/auth/register
4. Backend validates and checks duplicates
5. Password hashed with bcrypt
6. User created in database
7. JWT token generated
8. User logged in automatically
9. Redirect to student dashboard
```

### Login Flow (All Roles)
```
1. User enters username and password
2. POST /api/auth/login
3. Backend verifies credentials
4. Check if user is active
5. Update last_login timestamp
6. Generate JWT token
7. Return user data and token
8. Frontend stores token in localStorage
9. Redirect based on role:
   - student → Student Dashboard
   - vendor → Vendor Dashboard
   - admin → Admin Dashboard
```

### Protected Route Access
```
1. User makes request to protected endpoint
2. Frontend sends JWT token in Authorization header
3. Backend verifyToken middleware checks token
4. If valid, attach user to req.user
5. requireRole middleware checks user role
6. If authorized, proceed to controller
7. If not, return 403 Forbidden
```

---

## 🎨 UI/UX Design Guidelines

### Login Page
- Clean, centered design
- Username and password fields
- "Remember me" checkbox
- "Forgot password?" link
- "Sign up" link for students
- Role indicator (optional)

### Student Registration
- Multi-step form or single page
- Real-time validation
- Password strength indicator
- Terms and conditions checkbox
- Clear error messages
- Success message with auto-redirect

### Student Dashboard
- Welcome message with name
- Quick stats (orders today, total spent)
- Browse items section
- Recent orders
- Profile quick access

### Vendor Dashboard
- Scan QR code button (prominent)
- Today's verified orders count
- Recent scans list
- Quick stats

### Admin Dashboard
- System overview
- User statistics
- Inventory alerts
- Recent activities
- Management shortcuts

---

## 🔒 Security Features

### Implemented
- ✅ Password hashing (bcrypt with salt)
- ✅ JWT token authentication
- ✅ Token expiration (24 hours)
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

### To Implement
- [ ] Rate limiting (prevent brute force)
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Password reset via email
- [ ] Account lockout after failed attempts
- [ ] Two-factor authentication (optional)
- [ ] Session management
- [ ] Audit logging

---

## 📱 QR Code Scanning

### Implementation Options

**Option 1: react-qr-reader (Recommended)**
```bash
npm install react-qr-reader
```
- Easy to use
- Good browser support
- Real-time scanning

**Option 2: html5-qrcode**
```bash
npm install html5-qrcode
```
- More features
- Better customization
- Supports multiple cameras

**Option 3: react-webcam + jsQR**
```bash
npm install react-webcam jsqr
```
- More control
- Custom UI
- Manual processing

### QR Scanning Flow
```
1. Vendor clicks "Scan QR Code"
2. Request camera permission
3. Camera opens in modal/fullscreen
4. Scan QR code
5. Extract order_id from QR data
6. POST /api/orders/verify with order_id
7. Display order details
8. Show items in order
9. Confirm verification
10. Mark as consumed
11. Show success message
```

---

## 📊 Order History Features

### For Students
- List all orders (paginated)
- Filter by status (All, Paid, Consumed)
- Filter by date range
- Search by order ID
- View order details
- Reorder functionality
- Download receipt

### Display Information
- Order ID
- Date and time
- Items ordered (with quantities)
- Total amount
- Status badge
- Payment reference
- QR code (for paid orders)

---

## 🎯 Next Implementation Steps

### Step 1: Setup Frontend Auth (Priority: HIGH)
1. Install dependencies (react-router-dom v6, axios)
2. Create AuthContext for state management
3. Create PrivateRoute component
4. Setup token storage (localStorage)
5. Add axios interceptors for auth headers

### Step 2: Create Auth Pages (Priority: HIGH)
1. Login page
2. Student registration page
3. Forgot password page

### Step 3: Update Existing Pages (Priority: MEDIUM)
1. Add authentication to StudentPage
2. Add authentication to VendorPage
3. Create role-based routing

### Step 4: Create New Pages (Priority: MEDIUM)
1. Student Dashboard
2. Order History
3. Profile Page
4. Vendor Dashboard
5. Admin Dashboard

### Step 5: Add QR Scanning (Priority: HIGH)
1. Install QR scanner library
2. Create QR Scanner component
3. Integrate with vendor verification
4. Test with real QR codes

### Step 6: Polish & Test (Priority: LOW)
1. Add loading states
2. Improve error handling
3. Add success notifications
4. Test all flows
5. Fix bugs

---

## 📦 Required npm Packages

### Backend (Already Added)
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- express-validator - Input validation

### Frontend (To Install)
```bash
cd frontend
npm install react-qr-reader
npm install react-toastify  # For notifications
npm install react-icons     # For icons
```

---

## 🚀 Deployment Considerations

### Environment Variables
- Change JWT_SECRET to strong random string
- Use HTTPS in production
- Set secure cookie flags
- Configure CORS properly

### Database
- Run auth_schema.sql on production database
- Create admin user with strong password
- Backup database before deployment

### Security
- Enable rate limiting
- Add helmet.js for security headers
- Configure CSP (Content Security Policy)
- Enable HTTPS only
- Secure session storage

---

**Status**: Backend authentication complete ✅  
**Next**: Frontend authentication UI and QR scanning 🚀
