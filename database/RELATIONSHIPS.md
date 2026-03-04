# 🔗 Database Relationships & Business Logic

## Visual Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ user_id (PK)    │
│ name            │
│ email (UNIQUE)  │
│ phone           │
│ role (ENUM)     │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:M (One user, many orders)
         │
         ▼
┌─────────────────┐          ┌──────────────────┐
│     ORDERS      │          │   ORDER_ITEMS    │
│─────────────────│          │──────────────────│
│ order_id (PK)   │◄─────────│ order_item_id(PK)│
│ user_id (FK)    │   1:M    │ order_id (FK)    │
│ total_amount    │          │ item_id (FK)     │
│ status (ENUM)   │          │ quantity         │
│ qr_code_data    │          │ price_at_order   │
│ created_at      │          │ subtotal         │
│ updated_at      │          │ created_at       │
│ consumed_at     │          └────────┬─────────┘
└────────┬────────┘                   │
         │                            │ M:1
         │ 1:1                        │
         │                            ▼
         ▼                   ┌─────────────────┐
┌─────────────────┐          │     ITEMS       │
│    PAYMENTS     │          │─────────────────│
│─────────────────│          │ item_id (PK)    │
│ payment_id (PK) │          │ name            │
│ order_id (FK)   │          │ description     │
│ payment_ref(UNQ)│          │ price           │
│ amount          │          │ stock_quantity  │
│ status (ENUM)   │          │ category        │
│ payment_method  │          │ is_available    │
│ transaction_time│          │ image_url       │
│ created_at      │          │ created_at      │
└─────────────────┘          │ updated_at      │
                             └─────────────────┘
```

---

## Relationship Details

### 1. Users → Orders (1:M)
**Type**: One-to-Many  
**Description**: One user can place multiple orders

```sql
-- Foreign Key
orders.user_id REFERENCES users.user_id ON DELETE CASCADE
```

**Business Logic**:
- When a user is deleted, all their orders are deleted (CASCADE)
- A user can have 0 or more orders
- Each order belongs to exactly one user

---

### 2. Orders → Order_Items (1:M)
**Type**: One-to-Many  
**Description**: One order can contain multiple items

```sql
-- Foreign Key
order_items.order_id REFERENCES orders.order_id ON DELETE CASCADE
```

**Business Logic**:
- When an order is deleted, all its items are deleted (CASCADE)
- An order must have at least 1 item
- Each order_item belongs to exactly one order

---

### 3. Items → Order_Items (1:M)
**Type**: One-to-Many  
**Description**: One item can appear in multiple orders

```sql
-- Foreign Key
order_items.item_id REFERENCES items.item_id ON DELETE CASCADE
```

**Business Logic**:
- An item can be in 0 or more orders
- Each order_item references exactly one item
- price_at_order stores historical price (item price may change)

---

### 4. Orders ↔ Items (M:M through Order_Items)
**Type**: Many-to-Many  
**Description**: Orders and Items have a many-to-many relationship

**Junction Table**: order_items

**Business Logic**:
- One order can have many items
- One item can be in many orders
- Quantity and price are stored in the junction table
- UNIQUE(order_id, item_id) prevents duplicate items in same order

---

### 5. Orders → Payments (1:1)
**Type**: One-to-One  
**Description**: Each order has exactly one payment

```sql
-- Foreign Key + Unique Constraint
payments.order_id REFERENCES orders.order_id ON DELETE CASCADE
UNIQUE(order_id)
```

**Business Logic**:
- One order has exactly one payment
- payment_ref is globally unique (prevents reuse)
- Payment amount must match order total_amount
- Payment status determines order status

---

## Status Flow & Constraints

### Order Status Transitions

```
┌─────────┐
│ CREATED │  ← Order placed, items selected
└────┬────┘
     │
     │ Payment confirmed
     │ (payment.status = SUCCESS)
     ▼
┌─────────┐
│  PAID   │  ← Payment verified, ready for pickup
└────┬────┘
     │
     │ Vendor scans QR / enters Order ID
     │ (verify payment_ref is unique)
     ▼
┌──────────┐
│ CONSUMED │  ← Order picked up, stock deducted
└──────────┘
     │
     │ CANNOT GO BACK
     ▼
   [END]
```

**Validation Rules** (enforced in backend):
```javascript
// Allowed transitions
CREATED → PAID      ✅ (after payment success)
PAID → CONSUMED     ✅ (vendor verification)

// Forbidden transitions
CONSUMED → PAID     ❌ (prevent reuse)
CONSUMED → CREATED  ❌ (prevent reuse)
CREATED → CONSUMED  ❌ (must pay first)
PAID → CREATED      ❌ (cannot unpay)
```

---

### Payment Status Flow

```
┌─────────┐
│ PENDING │  ← Payment initiated
└────┬────┘
     │
     ├──────────┐
     │          │
     ▼          ▼
┌─────────┐  ┌────────┐
│ SUCCESS │  │ FAILED │
└─────────┘  └────────┘
     │
     │ Update order.status = PAID
     ▼
  [DONE]
```

---

## Unique Constraints & Their Purpose

### 1. users.email (UNIQUE)
**Purpose**: Prevent duplicate user accounts

```sql
-- Example
INSERT INTO users (name, email, role) 
VALUES ('John', 'john@college.edu', 'student');

-- This will FAIL (duplicate email)
INSERT INTO users (name, email, role) 
VALUES ('John Doe', 'john@college.edu', 'student');
```

---

### 2. payments.payment_ref (UNIQUE)
**Purpose**: Prevent duplicate order consumption

```sql
-- Example
INSERT INTO payments (order_id, payment_ref, amount) 
VALUES (1, 'PAY-1709567890-A3F9B2', 150.00);

-- This will FAIL (duplicate payment_ref)
INSERT INTO payments (order_id, payment_ref, amount) 
VALUES (2, 'PAY-1709567890-A3F9B2', 200.00);
```

**Business Impact**:
- Vendor scans QR code → checks payment_ref
- If payment_ref already used → reject (order already consumed)
- If payment_ref not found → reject (invalid order)
- If payment_ref valid and unused → allow consumption

---

### 3. payments.order_id (UNIQUE)
**Purpose**: One payment per order

```sql
-- Example
INSERT INTO payments (order_id, payment_ref, amount) 
VALUES (1, 'PAY-123', 150.00);

-- This will FAIL (order already has payment)
INSERT INTO payments (order_id, payment_ref, amount) 
VALUES (1, 'PAY-456', 150.00);
```

---

### 4. order_items(order_id, item_id) (UNIQUE)
**Purpose**: Prevent duplicate items in same order

```sql
-- Example
INSERT INTO order_items (order_id, item_id, quantity) 
VALUES (1, 5, 2);  -- 2 Samosas

-- This will FAIL (item 5 already in order 1)
INSERT INTO order_items (order_id, item_id, quantity) 
VALUES (1, 5, 3);

-- Solution: Update quantity instead
UPDATE order_items 
SET quantity = quantity + 3 
WHERE order_id = 1 AND item_id = 5;
```

---

## Check Constraints & Validation

### Price & Amount Validation
```sql
-- All prices must be non-negative
CHECK (price >= 0)
CHECK (total_amount >= 0)
CHECK (amount >= 0)
```

### Stock Validation
```sql
-- Stock cannot be negative
CHECK (stock_quantity >= 0)
```

### Quantity Validation
```sql
-- Order quantity must be positive
CHECK (quantity > 0)
```

### Consumed Time Validation
```sql
-- consumed_at must be NULL unless status = CONSUMED
CHECK (
    (status = 'CONSUMED' AND consumed_at IS NOT NULL) OR 
    (status != 'CONSUMED' AND consumed_at IS NULL)
)
```

---

## Cascade Delete Behavior

### When a User is Deleted:
```
DELETE users → CASCADE DELETE orders 
            → CASCADE DELETE order_items
            → CASCADE DELETE payments
```

### When an Order is Deleted:
```
DELETE orders → CASCADE DELETE order_items
             → CASCADE DELETE payments
```

### When an Item is Deleted:
```
DELETE items → CASCADE DELETE order_items
```

**Note**: For production, consider soft deletes instead of CASCADE.

---

## Example Data Flow

### Scenario: Student Orders 2 Samosas and 1 Tea

```sql
-- Step 1: Create Order
INSERT INTO orders (user_id, total_amount, status) 
VALUES (1, 35.00, 'CREATED') 
RETURNING order_id;  -- Returns: 101

-- Step 2: Add Order Items
INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal)
VALUES 
  (101, 5, 2, 10.00, 20.00),  -- 2 Samosas @ ₹10 each
  (101, 8, 1, 15.00, 15.00);  -- 1 Tea @ ₹15

-- Step 3: Simulate Payment
INSERT INTO payments (order_id, payment_ref, amount, status)
VALUES (101, 'PAY-1709567890-A3F9B2', 35.00, 'SUCCESS');

-- Step 4: Update Order Status
UPDATE orders 
SET status = 'PAID', qr_code_data = '101' 
WHERE order_id = 101;

-- Step 5: Vendor Verifies (later)
-- Check if payment_ref exists and order not consumed
SELECT o.order_id, o.status, p.payment_ref
FROM orders o
JOIN payments p ON o.order_id = p.order_id
WHERE o.order_id = 101 AND o.status = 'PAID';

-- Step 6: Mark as Consumed
UPDATE orders 
SET status = 'CONSUMED', consumed_at = CURRENT_TIMESTAMP 
WHERE order_id = 101;

-- Step 7: Deduct Stock
UPDATE items 
SET stock_quantity = stock_quantity - 2 
WHERE item_id = 5;  -- Samosas

UPDATE items 
SET stock_quantity = stock_quantity - 1 
WHERE item_id = 8;  -- Tea
```

---

## Summary

✅ **5 Tables** with clear relationships  
✅ **Foreign Keys** with CASCADE delete  
✅ **Unique Constraints** prevent duplicates  
✅ **Check Constraints** ensure data validity  
✅ **Status Flow** enforced in backend  
✅ **Indexes** for performance  
✅ **Timestamps** for analytics  

**Phase 1 Complete** - Ready for backend implementation!
