# 📡 API Documentation

Base URL: `http://localhost:5000/api`

---

## 🔍 Health Check

### GET /health
Check if server is running

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-04T10:00:00.000Z"
}
```

---

## 🍽️ Items API

### GET /api/items
Get all available items

**Response:**
```json
{
  "success": true,
  "count": 19,
  "data": [
    {
      "item_id": 1,
      "name": "Samosa",
      "description": "Crispy fried pastry with spiced potato filling",
      "price": "10.00",
      "stock_quantity": 100,
      "category": "Snacks",
      "is_available": true,
      "image_url": null,
      "created_at": "2024-03-04T10:00:00.000Z",
      "updated_at": "2024-03-04T10:00:00.000Z"
    }
  ]
}
```

### GET /api/items/:id
Get item by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "item_id": 1,
    "name": "Samosa",
    "price": "10.00",
    "stock_quantity": 100
  }
}
```

---

## 📦 Orders API

### POST /api/orders/create
Create a new order

**Request Body:**
```json
{
  "user_id": 1,
  "items": [
    {
      "item_id": 1,
      "quantity": 2
    },
    {
      "item_id": 6,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 4,
    "user_id": 1,
    "total_amount": "30.00",
    "status": "CREATED",
    "created_at": "2024-03-04T10:00:00.000Z",
    "items": [
      {
        "order_item_id": 10,
        "order_id": 4,
        "item_id": 1,
        "quantity": 2,
        "price_at_order": "10.00",
        "subtotal": "20.00"
      }
    ]
  }
}
```

**Validation:**
- `user_id` is required
- `items` must be an array with at least one item
- Each item must have valid `item_id` and `quantity > 0`
- Items must be available and have sufficient stock

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "message": "Insufficient stock for \"Samosa\". Available: 5"
  }
}
```

### GET /api/orders/:id
Get order details by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 2,
    "user_id": 2,
    "total_amount": "95.00",
    "status": "PAID",
    "qr_code_data": "2",
    "created_at": "2024-03-04T11:00:00.000Z",
    "updated_at": "2024-03-04T11:05:00.000Z",
    "consumed_at": null,
    "user_name": "Priya Patel",
    "user_email": "priya.patel@college.edu",
    "items": [
      {
        "order_item_id": 4,
        "item_id": 11,
        "quantity": 1,
        "price_at_order": "60.00",
        "subtotal": "60.00",
        "item_name": "Veg Thali",
        "category": "Main Course"
      }
    ]
  }
}
```

### POST /api/orders/verify
Verify and consume order (Vendor endpoint)

**Request Body:**
```json
{
  "order_id": 2
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Order verified and marked as consumed",
  "data": {
    "order_id": 2,
    "status": "CONSUMED",
    "consumed_at": "2024-03-04T12:00:00.000Z",
    "items": [
      {
        "item_name": "Veg Thali",
        "quantity": 1
      }
    ]
  }
}
```

**Error Responses:**

Order not found:
```json
{
  "success": false,
  "error": {
    "message": "Order not found"
  }
}
```

Order not paid:
```json
{
  "success": false,
  "message": "Order cannot be consumed. Current status: CREATED"
}
```

Order already consumed:
```json
{
  "success": false,
  "message": "Order already consumed"
}
```

**Business Logic:**
1. Checks if order exists
2. Verifies payment is successful
3. Checks order status is PAID
4. Marks order as CONSUMED
5. Deducts stock for all items
6. Returns success with consumed timestamp

---

## 💳 Payments API

### POST /api/payments/confirm
Confirm payment (Simulate payment)

**Request Body:**
```json
{
  "order_id": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "order_id": 4,
    "payment_ref": "PAY-1709567892-C5H9D4",
    "amount": "30.00",
    "status": "PAID",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "transaction_time": "2024-03-04T10:05:00.000Z"
  }
}
```

**Validation:**
- Order must exist
- Order status must be CREATED
- Cannot pay for already paid orders

**Error Responses:**

Order not found:
```json
{
  "success": false,
  "error": {
    "message": "Order not found"
  }
}
```

Already paid:
```json
{
  "success": false,
  "error": {
    "message": "Payment already completed for this order"
  }
}
```

Invalid status:
```json
{
  "success": false,
  "error": {
    "message": "Cannot process payment. Order status is CONSUMED"
  }
}
```

**Business Logic:**
1. Validates order exists and is in CREATED status
2. Creates payment record with unique payment_ref
3. Marks payment as SUCCESS (simulated)
4. Generates QR code with order_id
5. Updates order status to PAID
6. Returns payment details and QR code

### GET /api/payments/order/:order_id
Get payment details by order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 2,
    "order_id": 2,
    "payment_ref": "PAY-1709567891-B4G8C3",
    "amount": "95.00",
    "status": "SUCCESS",
    "payment_method": "SIMULATED",
    "transaction_time": "2024-03-04T11:00:00.000Z",
    "created_at": "2024-03-04T11:00:00.000Z"
  }
}
```

---

## 🔄 Order Status Flow

```
CREATED → PAID → CONSUMED
```

### Status Transitions

| From | To | Allowed | Trigger |
|------|-----|---------|---------|
| CREATED | PAID | ✅ | Payment confirmation |
| PAID | CONSUMED | ✅ | Vendor verification |
| CONSUMED | PAID | ❌ | Not allowed |
| CREATED | CONSUMED | ❌ | Must pay first |

---

## 🚨 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

### Common Errors

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "message": "user_id is required"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "message": "Order not found"
  }
}
```

**Duplicate Entry (409):**
```json
{
  "success": false,
  "error": {
    "message": "Duplicate entry: Key (email)=(test@test.com) already exists"
  }
}
```

---

## 🧪 Testing with cURL

### Get all items
```bash
curl http://localhost:5000/api/items
```

### Create order
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

### Confirm payment
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{"order_id": 4}'
```

### Verify order
```bash
curl -X POST http://localhost:5000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{"order_id": 2}'
```

---

## 📊 Database Constraints

### Unique Constraints
- `users.email` - No duplicate emails
- `payments.payment_ref` - Prevents duplicate consumption
- `payments.order_id` - One payment per order

### Check Constraints
- All prices and amounts must be >= 0
- Stock quantity must be >= 0
- Order quantity must be > 0

### Foreign Keys
- All foreign keys use CASCADE delete
- Deleting an order deletes its items and payment

---

## 🔐 Security Notes

**Current MVP:**
- No authentication required
- No authorization checks
- All endpoints are public

**For Production:**
- Add JWT authentication
- Role-based access control (student vs vendor)
- Rate limiting
- Input sanitization
- SQL injection prevention (using parameterized queries)
