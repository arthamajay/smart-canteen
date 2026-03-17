# Smart Canteen — Order & Payment Verification System

A full-stack web application for managing canteen orders with QR-based verification, role-based access control, and real-time inventory management.

**Live Demo:** [https://smart-canteen-cvr.netlify.app](https://smart-canteen-cvr.netlify.app)

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios, React Toastify
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Netlify (frontend) · Render (backend)

## Features

### Student
- Register and login with role-based access
- Browse menu items by category
- Place orders and simulate payment
- View QR code for order pickup
- Order history with status tracking
- Profile management and password change

### Vendor
- Login and view pending orders dashboard
- Scan QR codes via camera to verify and consume orders
- Manual order ID entry as fallback
- Real-time stats (pending orders, consumed today)

### Admin
- Full dashboard with analytics and revenue tracking
- Create and manage vendor accounts
- Add, edit, and deactivate menu items
- View all registered students
- Order status breakdown and peak hour charts

## Order Flow

```
CREATED → PAID → CONSUMED
```
Stock is deducted on order creation. Payment is simulated. Vendor scans QR to mark as consumed.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase project)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your DB credentials and JWT secret
node migrate.js        # creates all tables + seeds admin user
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
# create .env with:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### Default Admin Credentials
```
Username: admin
Password: admin123
```

## Project Structure

```
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth (JWT) + error handling
│   ├── models/         # DB query models
│   ├── routes/         # Express routers
│   ├── utils/          # QR code generator, validators
│   └── migrate.js      # One-shot DB migration + seed
├── database/
│   └── *.sql           # Schema files
└── frontend/
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # Auth context (React Context API)
        ├── pages/      # Student, Vendor, Admin pages
        └── services/   # Axios API client
```

## Environment Variables

### Backend (`.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `24h`) |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Allowed CORS origin |

### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
