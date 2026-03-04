# 🍽️ Smart Canteen Order & Payment Verification System

A full-stack web application for college canteen order management with payment verification and QR code-based order consumption tracking.

---

## 🎯 Project Overview

This system enables:

### For Students:
- Browse available food items
- Create orders with multiple items
- Simulate payment
- Receive unique Order ID and QR code
- Track order status

### For Vendors:
- Scan or manually enter Order ID
- Verify payment status
- Mark orders as CONSUMED
- Prevent duplicate order usage

### System Features:
- Order status flow: CREATED → PAID → CONSUMED
- Unique payment reference system
- Stock deduction after consumption
- Data collection for future analytics
- Duplicate prevention mechanism

---

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **QR Code**: QR code generation library
- **API Communication**: Axios

---

## 📁 Project Structure

```
smart-canteen/
├── backend/          # Node.js + Express API
├── frontend/         # React application
├── database/         # SQL schema and seed data
└── README.md         # This file
```

See `PROJECT_STRUCTURE.md` for detailed folder structure.

---

## 🗄️ Database Schema

### Tables:
1. **users** - Student and vendor information
2. **items** - Food items with pricing and stock
3. **orders** - Order management with status tracking
4. **order_items** - Junction table for order-item relationship
5. **payments** - Payment verification with unique references

### Key Relationships:
- One user → Many orders
- One order → Many items (through order_items)
- One order → One payment
- Unique payment_ref prevents duplicate consumption

See `database/SCHEMA_EXPLANATION.md` for detailed schema documentation.

---

## 🔄 Order Status Flow

```
CREATED   → Order placed, awaiting payment
    ↓
PAID      → Payment confirmed, ready for pickup
    ↓
CONSUMED  → Order picked up, cannot be reused
```

**Business Rules**:
- Only PAID orders can be marked as CONSUMED
- CONSUMED orders cannot be reused
- Each payment_ref is unique
- Stock is deducted only after CONSUMED status

---

## 🚀 Development Phases

### ✅ Phase 1: Project Architecture & Database Design (COMPLETED)
- [x] Full folder structure defined
- [x] SQL schema created
- [x] Relationships documented
- [x] Constraints and indexes added

### ✅ Phase 2: Backend Setup (Node + Express) (COMPLETED)
- [x] Express server setup
- [x] PostgreSQL connection
- [x] API endpoints implementation
- [x] Status validation logic
- [x] Error handling
- [x] QR code generation
- [x] Transaction support
- [x] Seed data created

### 🔜 Phase 3: Frontend (React)
- [ ] Student interface
- [ ] Vendor interface
- [ ] API integration
- [ ] QR code generation

### 🔜 Phase 4: Inventory Logic & Data Integrity
- [ ] Stock deduction logic
- [ ] Transaction handling
- [ ] Payment reference validation

### 🔜 Phase 5: Data Collection for Future ML
- [ ] Analytics queries
- [ ] Data export structure
- [ ] Timestamp tracking

---

## 📊 Analytics Support

The system collects data for future machine learning:
- Order timestamps (peak hours analysis)
- Item popularity (recommendation system)
- Revenue tracking (sales forecasting)
- Order fulfillment time (efficiency metrics)

---

## 🔒 Security & Data Integrity

- Foreign key constraints with CASCADE delete
- Unique constraints on email and payment_ref
- CHECK constraints on prices and quantities
- Status transition validation in backend
- Indexed columns for performance

---

## 📝 Notes

- **MVP Focus**: No authentication system in initial version
- **Simulated Payment**: No external payment gateway integration
- **Clean Architecture**: Modular, scalable, production-quality code
- **SQL Database**: PostgreSQL for relational data integrity

---

## 👨‍💻 Development Approach

Building phase by phase with approval gates:
1. Complete one phase
2. Stop and wait for confirmation
3. Proceed to next phase only after approval

---

## 📄 License

This is a college project for educational purposes.

---

**Current Status**: Phase 2 Complete ✅  
**Next Step**: Awaiting approval to proceed to Phase 3
