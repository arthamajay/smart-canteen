# 🧪 Phase 4 Testing Guide

Test scenarios for the enhanced inventory management system.

---

## 🚀 Setup

Make sure backend is running:
```bash
cd backend
npm run dev
```

---

## Test 1: Stock Reservation on Order Creation

### Objective
Verify that stock is deducted immediately when order is created.

### Steps

1. **Check initial stock:**
```bash
curl http://localhost:5000/api/items/1
```
Note the `stock_quantity` (e.g., 100)

2. **Create order:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [{"item_id": 1, "quantity": 5}]
  }'
```

3. **Check stock again:**
```bash
curl http://localhost:5000/api/items/1
```

### Expected Result
- Stock should be 95 (100 - 5)
- Stock deducted immediately, not waiting for consumption

---

## Test 2: Concurrent Order Handling

### Objective
Verify that two simultaneous orders don't cause overselling.

### Steps

1. **Check stock:**
```bash
curl http://localhost:5000/api/items/1
```
Note stock (e.g., 95)

2. **Open two terminals and run simultaneously:**

**Terminal 1:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "items": [{"item_id": 1, "quantity": 50}]}'
```

**Terminal 2 (run immediately):**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "items": [{"item_id": 1, "quantity": 50}]}'
```

### Expected Result
- First request: Success (stock becomes 45)
- Second request: Error "Insufficient stock. Requested: 50, Available: 45"
- Total stock deducted: 50 (not 100)

---

## Test 3: Negative Stock Prevention

### Objective
Verify that orders cannot reduce stock below zero.

### Steps

1. **Check stock:**
```bash
curl http://localhost:5000/api/items/1
```
Note stock (e.g., 45)

2. **Try to order more than available:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "items": [{"item_id": 1, "quantity": 100}]}'
```

### Expected Result
- Error: "Insufficient stock for 'Samosa'. Requested: 100, Available: 45"
- Stock remains 45

---

## Test 4: Transaction Rollback

### Objective
Verify that if order creation fails, stock is rolled back.

### Steps

1. **Check stock:**
```bash
curl http://localhost:5000/api/items/1
```
Note stock (e.g., 45)

2. **Create order with invalid user_id:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": 99999, "items": [{"item_id": 1, "quantity": 5}]}'
```

3. **Check stock again:**
```bash
curl http://localhost:5000/api/items/1
```

### Expected Result
- Order creation fails
- Stock remains 45 (not deducted)

---

## Test 5: Low Stock Alert

### Objective
Test the low stock monitoring system.

### Steps

1. **Get low stock items (threshold 50):**
```bash
curl http://localhost:5000/api/inventory/low-stock?threshold=50
```

### Expected Result
- Returns items with stock <= 50
- Includes item_id, name, stock_quantity, category

**Example Response:**
```json
{
  "success": true,
  "threshold": 50,
  "count": 2,
  "data": [
    {
      "item_id": 1,
      "name": "Samosa",
      "stock_quantity": 45,
      "category": "Snacks"
    }
  ]
}
```

---

## Test 6: Stock Level Monitoring

### Objective
Test the stock level monitoring API.

### Steps

1. **Get all stock levels:**
```bash
curl http://localhost:5000/api/inventory/stock-levels
```

### Expected Result
- Returns all items with current stock
- Includes price, category, availability

---

## Test 7: Stock Update (Admin)

### Objective
Test manual stock update functionality.

### Steps

1. **Update stock:**
```bash
curl -X POST http://localhost:5000/api/inventory/update-stock \
  -H "Content-Type: application/json" \
  -d '{"item_id": 1, "quantity": 100}'
```

2. **Verify update:**
```bash
curl http://localhost:5000/api/items/1
```

### Expected Result
- Stock updated to 100
- updated_at timestamp changed

---

## Test 8: Availability Check

### Objective
Test pre-order availability validation.

### Steps

1. **Check availability:**
```bash
curl -X POST http://localhost:5000/api/inventory/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"item_id": 1, "quantity": 5},
      {"item_id": 6, "quantity": 2}
    ]
  }'
```

### Expected Result
- Returns validation for each item
- Shows available stock
- Indicates if order is possible

**Example Response:**
```json
{
  "success": true,
  "allAvailable": true,
  "data": [
    {
      "item_id": 1,
      "name": "Samosa",
      "valid": true,
      "available_stock": 100
    },
    {
      "item_id": 6,
      "name": "Tea",
      "valid": true,
      "available_stock": 200
    }
  ]
}
```

---

## Test 9: Multiple Items Order

### Objective
Test order with multiple different items.

### Steps

1. **Create multi-item order:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {"item_id": 1, "quantity": 2},
      {"item_id": 6, "quantity": 1},
      {"item_id": 11, "quantity": 1}
    ]
  }'
```

2. **Verify all stocks deducted:**
```bash
curl http://localhost:5000/api/items/1
curl http://localhost:5000/api/items/6
curl http://localhost:5000/api/items/11
```

### Expected Result
- All items have stock deducted
- Order created successfully

---

## Test 10: Order Verification (No Double Deduction)

### Objective
Verify that stock is NOT deducted again during order verification.

### Steps

1. **Create and pay for order:**
```bash
# Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "items": [{"item_id": 1, "quantity": 3}]}')

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"order_id":[0-9]*' | grep -o '[0-9]*')

# Confirm payment
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d "{\"order_id\": $ORDER_ID}"
```

2. **Check stock before verification:**
```bash
curl http://localhost:5000/api/items/1
```
Note the stock (e.g., 97)

3. **Verify order:**
```bash
curl -X POST http://localhost:5000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d "{\"order_id\": $ORDER_ID}"
```

4. **Check stock after verification:**
```bash
curl http://localhost:5000/api/items/1
```

### Expected Result
- Stock remains 97 (not deducted again)
- Order marked as CONSUMED
- Stock was already deducted during order creation

---

## 📊 Test Results Template

| Test | Status | Notes |
|------|--------|-------|
| 1. Stock Reservation | ⬜ | |
| 2. Concurrent Orders | ⬜ | |
| 3. Negative Stock Prevention | ⬜ | |
| 4. Transaction Rollback | ⬜ | |
| 5. Low Stock Alert | ⬜ | |
| 6. Stock Level Monitoring | ⬜ | |
| 7. Stock Update | ⬜ | |
| 8. Availability Check | ⬜ | |
| 9. Multiple Items Order | ⬜ | |
| 10. No Double Deduction | ⬜ | |

---

## 🐛 Common Issues

### Issue: "Insufficient stock" but stock shows available
**Cause:** Concurrent order just reserved the stock
**Solution:** Refresh stock levels and try again

### Issue: Transaction timeout
**Cause:** Database connection issue
**Solution:** Check PostgreSQL is running, restart backend

### Issue: Stock not rolling back
**Cause:** Transaction not properly committed/rolled back
**Solution:** Check database logs, verify transaction handling

---

## ✅ Success Criteria

All tests should pass with:
- ✅ Stock deducted immediately on order creation
- ✅ No overselling with concurrent orders
- ✅ Stock never goes negative
- ✅ Failed orders don't deduct stock
- ✅ Low stock alerts work
- ✅ Stock updates work
- ✅ No double deduction on verification

---

**Phase 4 testing complete!** 🎉
