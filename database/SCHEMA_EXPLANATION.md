# 📊 Database Schema Explanation

## 🎯 Overview
This database is designed to handle the complete order-payment-verification flow for a college canteen system with proper data integrity and analytics support.

---

## 📋 Tables & Relationships

### 1️⃣ **users** (Core Entity)
**Purpose**: Store information about students and vendors

| Column | Type | Description |
|--------|------|-------------|
| user_id | SERIAL (PK) | Unique identifier |
| name | VARCHAR(100) | User's full name |
| email | VARCHAR(100) UNIQUE | Email address (unique) |
| phone | VARCHAR(15) | Contact number |
| role | ENUM | 'student' or 'vendor' |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Key Points**:
- Email must be unique (prevents duplicate accounts)
- Role determines access level (student vs vendor)
- Indexed on email and role for fast lookups

---

### 2️⃣ **items** (Food Menu)
**Purpose**: Store all food items available in the canteen

| Column | Type | Description |
|--------|------|-------------|
| item_id | SERIAL (PK) | Unique identifier |
| name | VARCHAR(100) | Item name (e.g., "Samosa") |
| description | TEXT | Item description |
| price | DECIMAL(10,2) | Current price |
| stock_quantity | INTEGER | Available quantity |
| category | VARCHAR(50) | Category (e.g., "Snacks") |
| is_available | BOOLEAN | Availability flag |
| image_url | VARCHAR(255) | Item image URL |
| created_at | TIMESTAMP | When item was added |
| updated_at | TIMESTAMP | Last update time |

**Key Points**:
- Price and stock must be >= 0 (CHECK constraints)
- is_available flag for quick enable/disable
- Indexed on category and availability for filtering

---

### 3️⃣ **orders** (Order Management)
**Purpose**: Store order information and track status

| Column | Type | Description |
|--------|------|-------------|
| order_id | SERIAL (PK) | Unique order identifier |
| user_id | INTEGER (FK) | References users table |
| total_amount | DECIMAL(10,2) | Total order amount |
| status | ENUM | CREATED → PAID → CONSUMED |
| qr_code_data | TEXT | QR code data (order_id) |
| created_at | TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | Last status update |
| consumed_at | TIMESTAMP | When order was consumed |

**Key Points**:
- Status flow is strictly enforced: CREATED → PAID → CONSUMED
- consumed_at is only set when status = 'CONSUMED'
- QR code stores order_id for vendor scanning
- Foreign key to users (CASCADE delete)

**Status Flow Logic**:
```
CREATED  → Order placed, not paid yet
   ↓
PAID     → Payment confirmed, ready for pickup
   ↓
CONSUMED → Order picked up, cannot be reused
```

---

### 4️⃣ **order_items** (Junction Table)
**Purpose**: Link orders to items with quantities (many-to-many relationship)

| Column | Type | Description |
|--------|------|-------------|
| order_item_id | SERIAL (PK) | Unique identifier |
| order_id | INTEGER (FK) | References orders table |
| item_id | INTEGER (FK) | References items table |
| quantity | INTEGER | Number of items ordered |
| price_at_order | DECIMAL(10,2) | Price snapshot at order time |
| subtotal | DECIMAL(10,2) | quantity × price_at_order |
| created_at | TIMESTAMP | When item was added |

**Key Points**:
- Stores price_at_order (historical accuracy - price may change later)
- UNIQUE constraint on (order_id, item_id) prevents duplicate items
- Quantity must be > 0
- CASCADE delete when order is deleted

**Why price_at_order?**
If an item's price changes from ₹10 to ₹15, old orders should still show ₹10.

---

### 5️⃣ **payments** (Payment Verification)
**Purpose**: Store payment information and prevent duplicate usage

| Column | Type | Description |
|--------|------|-------------|
| payment_id | SERIAL (PK) | Unique identifier |
| order_id | INTEGER (FK) | References orders table |
| payment_ref | VARCHAR(100) UNIQUE | Unique payment reference |
| amount | DECIMAL(10,2) | Payment amount |
| status | ENUM | PENDING → SUCCESS → FAILED |
| payment_method | VARCHAR(50) | Payment method (simulated) |
| transaction_time | TIMESTAMP | Payment timestamp |
| created_at | TIMESTAMP | Record creation time |

**Key Points**:
- payment_ref is UNIQUE (prevents duplicate payments)
- One payment per order (UNIQUE constraint on order_id)
- Status tracks payment lifecycle
- Amount must match order total_amount

**Payment Reference Format** (to be generated in backend):
```
PAY-{timestamp}-{random}
Example: PAY-1709567890-A3F9B2
```

---

## 🔗 Relationships Diagram

```
users (1) ──────< orders (M)
                     │
                     │ (1)
                     │
                     ├──< order_items (M) >── items (1)
                     │
                     │ (1)
                     │
                     └──< payments (1)
```

**Explanation**:
- One user can have many orders (1:M)
- One order can have many items through order_items (M:M)
- One order has exactly one payment (1:1)
- One item can be in many orders (M:M)

---

## 🔒 Data Integrity Constraints

### Primary Keys
- Every table has a SERIAL primary key (auto-incrementing)

### Foreign Keys
- `orders.user_id` → `users.user_id` (CASCADE delete)
- `order_items.order_id` → `orders.order_id` (CASCADE delete)
- `order_items.item_id` → `items.item_id` (CASCADE delete)
- `payments.order_id` → `orders.order_id` (CASCADE delete)

### Unique Constraints
- `users.email` - No duplicate emails
- `payments.payment_ref` - No duplicate payment references
- `payments.order_id` - One payment per order
- `order_items(order_id, item_id)` - No duplicate items in same order

### Check Constraints
- All prices and amounts must be >= 0
- Stock quantity must be >= 0
- Order item quantity must be > 0
- consumed_at must be NULL unless status = 'CONSUMED'

### Indexes
Created on frequently queried columns:
- `users.email`, `users.role`
- `items.category`, `items.is_available`
- `orders.user_id`, `orders.status`, `orders.created_at`
- `payments.payment_ref`, `payments.status`

---

## 🔄 Status Flow Validation

### Order Status Transitions (to be enforced in backend)
```
CREATED → PAID     ✅ Allowed (after payment)
PAID → CONSUMED    ✅ Allowed (vendor verification)
CONSUMED → PAID    ❌ NOT ALLOWED (prevent reuse)
CREATED → CONSUMED ❌ NOT ALLOWED (must pay first)
```

### Payment Status Transitions
```
PENDING → SUCCESS  ✅ Allowed
PENDING → FAILED   ✅ Allowed
SUCCESS → PENDING  ❌ NOT ALLOWED
FAILED → SUCCESS   ❌ NOT ALLOWED
```

---

## 📈 Analytics Support

The schema is designed to support future ML and analytics:

### Timestamps for Time-Series Analysis
- `orders.created_at` - Order time
- `orders.consumed_at` - Consumption time
- `payments.transaction_time` - Payment time

### Useful Analytics Queries
1. **Peak Hours**: Group by hour from created_at
2. **Popular Items**: Count from order_items
3. **Revenue Tracking**: Sum total_amount by date
4. **Average Order Value**: AVG(total_amount)
5. **Stock Movement**: Track stock_quantity changes
6. **Order Fulfillment Time**: consumed_at - created_at

---

## 🎯 Key Design Decisions

1. **ENUM Types**: Used for status fields to enforce valid values at DB level
2. **Soft Delete Not Used**: Using CASCADE delete for simplicity (MVP)
3. **Price Snapshot**: price_at_order preserves historical accuracy
4. **Unique Payment Ref**: Prevents duplicate order consumption
5. **Timestamps Everywhere**: Essential for analytics and debugging
6. **Indexes on Foreign Keys**: Faster joins and lookups
7. **Auto-Update Triggers**: updated_at automatically maintained

---

## ✅ Phase 1 Complete

This schema provides:
- ✅ Clean relational design
- ✅ Data integrity through constraints
- ✅ Status flow enforcement
- ✅ Duplicate prevention
- ✅ Analytics-ready structure
- ✅ Scalable architecture

**Next Phase**: Backend implementation with these tables.
