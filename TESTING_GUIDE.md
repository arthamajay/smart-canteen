# 🧪 Testing Guide

Comprehensive testing scenarios for the Smart Canteen system.

---

## 🎯 Testing Overview

This guide covers:
- Manual testing scenarios
- API testing with cURL
- Frontend testing
- Backend testing
- Integration testing
- Edge cases

---

## 🔧 Setup for Testing

### Prerequisites
- Backend running on port 5000
- Frontend running on port 3000
- Database with seed data loaded

### Verify Setup
```bash
# Check backend
curl http://localhost:5000/health

# Check items
curl http://localhost:5000/api/items

# Check frontend
# Open http://localhost:3000 in browser
```

---

## 📋 Test Scenarios

### Scenario 1: Complete Order Flow (Happy Path)

**Objective:** Test full student-to-vendor flow

**Steps:**

1. **Student: Browse Items**
   - Open http://localhost:3000
   - Click "Student" button
   - Verify all items load
   - Check category filters work

2. **Student: Add to Cart**
   - Click "Add to Cart" on "Samosa"
   - Verify cart shows 1 Samosa
   - Click + button twice
   - Verify quantity is now 3
   - Add "Tea" to cart
   - Verify cart shows 2 items

3. **Student: Place Order**
   - Verify total is calculated correctly (₹30 + ₹10 = ₹40)
   - Click "Place Order"
   - Wait for processing
   - Verify success message appears

4. **Student: View QR Code**
   - Note the Order ID (e.g., 4)
   - Verify QR code image displays
   - Verify payment reference shown
   - Verify status is "PAID"

5. **Vendor: Verify Order**
   - Click "Vendor" button
   - Enter the Order ID from step 4
   - Click "Verify Order"
   - Verify success message
   - Verify order details shown
   - Verify items list correct
   - Verify status changed to "CONSUMED"

**Expected Result:** ✅ Order successfully placed and verified

---

### Scenario 2: Already Consumed Order

**Objective:** Test duplicate consumption prevention

**Steps:**

1. Click "Vendor" button
2. Enter Order ID: 1 (from seed data - already consumed)
3. Click "Verify Order"

**Expected Result:** ❌ Error: "Order already consumed"

---

### Scenario 3: Unpaid Order

**Objective:** Test payment validation

**Steps:**

1. Click "Vendor" button
2. Enter Order ID: 3 (from seed data - CREATED status)
3. Click "Verify Order"

**Expected Result:** ❌ Error: "Order cannot be consumed. Current status: CREATED"

---

### Scenario 4: Invalid Order ID

**Objective:** Test error handling

**Steps:**

1. Click "Vendor" button
2. Enter Order ID: 99999
3. Click "Verify Order"

**Expected Result:** ❌ Error: "Order not found"

---

### Scenario 5: Empty Cart

**Objective:** Test cart validation

**Steps:**

1. Click "Student" button
2. Don't add any items
3. Verify "Place Order" button is not visible
4. Verify empty cart message shown

**Expected Result:** ✅ Cannot place order with empty cart

---

### Scenario 6: Stock Validation

**Objective:** Test stock availability

**Steps:**

1. Find an item with low stock (check database)
2. Try to add more than available stock
3. Verify quantity limited to stock amount

**Expected Result:** ✅ Cannot exceed available stock

---

### Scenario 7: Category Filtering

**Objective:** Test item filtering

**Steps:**

1. Click "Student" button
2. Click "Snacks" category
3. Verify only snacks shown
4. Click "Beverages" category
5. Verify only beverages shown
6. Click "All" category
7. Verify all items shown

**Expected Result:** ✅ Filtering works correctly

---

### Scenario 8: Cart Quantity Controls

**Objective:** Test cart management

**Steps:**

1. Add "Samosa" to cart
2. Click + button 5 times
3. Verify quantity is 6
4. Click - button 3 times
5. Verify quantity is 3
6. Click - button 3 times
7. Verify item removed from cart

**Expected Result:** ✅ Quantity controls work correctly

---

### Scenario 9: Multiple Items Order

**Objective:** Test complex orders

**Steps:**

1. Add 2 Samosas
2. Add 1 Tea
3. Add 3 Spring Rolls
4. Add 1 Coffee
5. Verify cart shows 4 different items
6. Verify total calculated correctly
7. Place order
8. Verify all items in order confirmation

**Expected Result:** ✅ Multiple items handled correctly

---

### Scenario 10: Order After Verification

**Objective:** Test vendor workflow

**Steps:**

1. Place order as student (get Order ID)
2. Switch to vendor
3. Verify the order
4. Try to verify same order again

**Expected Result:** ❌ Error: "Order already consumed"

---

## 🔌 API Testing with cURL

### Test 1: Get All Items
```bash
curl http://localhost:5000/api/items
```

**Expected:** JSON array of items

---

### Test 2: Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {"item_id": 1, "quantity": 2},
      {"item_id": 6, "quantity": 1}
    ]
  }'
```

**Expected:** Order created with status CREATED

---

### Test 3: Confirm Payment
```bash
# Use order_id from Test 2
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{"order_id": 4}'
```

**Expected:** Payment confirmed, QR code returned

---

### Test 4: Verify Order
```bash
# Use order_id from Test 2
curl -X POST http://localhost:5000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{"order_id": 4}'
```

**Expected:** Order verified and marked as CONSUMED

---

### Test 5: Get Order Details
```bash
curl http://localhost:5000/api/orders/2
```

**Expected:** Order details with items

---

### Test 6: Invalid Order Creation
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": []
  }'
```

**Expected:** Error: "Order must contain at least one item"

---

### Test 7: Insufficient Stock
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {"item_id": 1, "quantity": 1000}
    ]
  }'
```

**Expected:** Error: "Insufficient stock"

---

## 🗄️ Database Testing

### Test 1: Check Order Status Flow
```sql
-- Create order
INSERT INTO orders (user_id, total_amount, status) 
VALUES (1, 50.00, 'CREATED') 
RETURNING order_id;

-- Try to mark as CONSUMED directly (should work in DB, but backend prevents)
UPDATE orders SET status = 'CONSUMED' WHERE order_id = <id>;

-- Check status
SELECT order_id, status FROM orders WHERE order_id = <id>;
```

---

### Test 2: Payment Reference Uniqueness
```sql
-- Try to insert duplicate payment_ref
INSERT INTO payments (order_id, payment_ref, amount, status)
VALUES (1, 'PAY-1709567890-A3F9B2', 50.00, 'SUCCESS');
```

**Expected:** Error: duplicate key value violates unique constraint

---

### Test 3: Stock Deduction
```sql
-- Check stock before
SELECT item_id, name, stock_quantity FROM items WHERE item_id = 1;

-- Deduct stock
UPDATE items SET stock_quantity = stock_quantity - 2 WHERE item_id = 1;

-- Check stock after
SELECT item_id, name, stock_quantity FROM items WHERE item_id = 1;
```

---

### Test 4: Cascade Delete
```sql
-- Create test order
INSERT INTO orders (user_id, total_amount, status) 
VALUES (1, 50.00, 'CREATED') 
RETURNING order_id;

-- Add order items
INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal)
VALUES (<order_id>, 1, 2, 10.00, 20.00);

-- Delete order
DELETE FROM orders WHERE order_id = <order_id>;

-- Check order_items (should be deleted)
SELECT * FROM order_items WHERE order_id = <order_id>;
```

**Expected:** No rows returned (cascade delete worked)

---

## 🎨 Frontend Testing

### Test 1: Component Rendering
- Open browser DevTools
- Check for console errors
- Verify all components render
- Check network tab for API calls

---

### Test 2: Responsive Design
- Resize browser window
- Test on mobile viewport (375px)
- Test on tablet viewport (768px)
- Test on desktop viewport (1200px)
- Verify layout adapts correctly

---

### Test 3: Error Handling
- Stop backend server
- Try to load items
- Verify error message shown
- Start backend server
- Refresh page
- Verify items load

---

### Test 4: Loading States
- Open Network tab in DevTools
- Throttle network to "Slow 3G"
- Place an order
- Verify loading spinner shows
- Verify button disabled during loading

---

## 🔍 Edge Cases

### Edge Case 1: Negative Quantity
**Test:** Try to set quantity to negative number
**Expected:** Quantity cannot go below 0

---

### Edge Case 2: Very Large Order
**Test:** Add 100 items to cart
**Expected:** System handles large orders

---

### Edge Case 3: Special Characters in Order ID
**Test:** Enter "abc" as Order ID
**Expected:** Error or validation message

---

### Edge Case 4: Concurrent Orders
**Test:** Place two orders simultaneously
**Expected:** Both orders created with unique IDs

---

### Edge Case 5: Browser Refresh During Order
**Test:** Place order, refresh during processing
**Expected:** Order may or may not complete (check backend logs)

---

## 📊 Test Results Template

### Test Execution Log

| Test ID | Scenario | Status | Notes |
|---------|----------|--------|-------|
| T1 | Complete Order Flow | ✅ Pass | |
| T2 | Already Consumed | ✅ Pass | |
| T3 | Unpaid Order | ✅ Pass | |
| T4 | Invalid Order ID | ✅ Pass | |
| T5 | Empty Cart | ✅ Pass | |
| T6 | Stock Validation | ✅ Pass | |
| T7 | Category Filter | ✅ Pass | |
| T8 | Cart Controls | ✅ Pass | |
| T9 | Multiple Items | ✅ Pass | |
| T10 | Duplicate Verify | ✅ Pass | |

---

## 🐛 Known Issues / Limitations

### Current MVP Limitations
1. No authentication (hardcoded user_id = 1)
2. No real QR scanning (manual entry only)
3. No order history
4. No real-time updates
5. No payment gateway integration

### Future Testing Needs
- Load testing (concurrent users)
- Security testing (SQL injection, XSS)
- Performance testing (large datasets)
- Accessibility testing (screen readers)
- Cross-browser testing

---

## ✅ Testing Checklist

### Backend
- [ ] All API endpoints work
- [ ] Error handling correct
- [ ] Status validation enforced
- [ ] Database constraints work
- [ ] QR code generation works
- [ ] Stock deduction works

### Frontend
- [ ] Items load correctly
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] QR code displays
- [ ] Vendor verification works
- [ ] Error messages show
- [ ] Loading states work
- [ ] Responsive design works

### Integration
- [ ] Frontend-backend communication
- [ ] Database transactions
- [ ] Status flow enforcement
- [ ] Stock management
- [ ] Payment simulation

---

## 📝 Bug Report Template

```
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**


**Environment:**
- OS: 
- Browser: 
- Backend version: 
- Frontend version: 

**Additional Notes:**

```

---

## 🎯 Test Coverage

### Current Coverage
- ✅ Happy path scenarios
- ✅ Error scenarios
- ✅ Validation scenarios
- ✅ Edge cases
- ✅ API testing
- ✅ Database testing
- ✅ Frontend testing

### Not Covered (Future)
- ❌ Load testing
- ❌ Security testing
- ❌ Automated tests
- ❌ E2E tests
- ❌ Performance tests

---

**Testing Complete!** All scenarios should pass for Phase 3. 🎉
