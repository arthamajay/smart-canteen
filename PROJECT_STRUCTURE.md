# Smart Canteen Order & Payment Verification System

## 📁 Full Project Structure

```
smart-canteen/
│
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection config
│   │
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Item.js              # Food item model
│   │   ├── Order.js             # Order model
│   │   ├── OrderItem.js         # Order items (junction table)
│   │   └── Payment.js           # Payment model
│   │
│   ├── controllers/
│   │   ├── itemController.js    # Handle item operations
│   │   ├── orderController.js   # Handle order creation & verification
│   │   └── paymentController.js # Handle payment simulation
│   │
│   ├── routes/
│   │   ├── itemRoutes.js        # Routes for items
│   │   ├── orderRoutes.js       # Routes for orders
│   │   └── paymentRoutes.js     # Routes for payments
│   │
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handling
│   │
│   ├── utils/
│   │   ├── qrGenerator.js       # QR code generation utility
│   │   └── validators.js        # Input validation helpers
│   │
│   ├── .env                      # Environment variables
│   ├── .env.example              # Example env file
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Main entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── student/
│   │   │   │   ├── ItemList.jsx      # Display food items
│   │   │   │   ├── OrderForm.jsx     # Create order form
│   │   │   │   └── OrderConfirm.jsx  # Show Order ID & QR
│   │   │   │
│   │   │   └── vendor/
│   │   │       ├── OrderVerify.jsx   # Verify order by ID/QR
│   │   │       └── VerifyResult.jsx  # Show verification result
│   │   │
│   │   ├── pages/
│   │   │   ├── StudentPage.jsx       # Student interface
│   │   │   └── VendorPage.jsx        # Vendor interface
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Axios API calls
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css                   # Global styles
│   │   └── index.js                  # React entry point
│   │
│   ├── package.json                  # Frontend dependencies
│   └── .env                          # Frontend env variables
│
├── database/
│   ├── schema.sql                    # Complete database schema
│   ├── seed.sql                      # Sample data for testing
│   └── queries.sql                   # Useful queries for analytics
│
└── README.md                         # Project documentation
```

## 🎯 Architecture Principles

1. **Separation of Concerns**: Clear separation between routes, controllers, and models
2. **Modular Design**: Each feature has its own module
3. **Scalability**: Easy to add new features without breaking existing code
4. **Clean Code**: Proper naming conventions and comments
5. **Error Handling**: Centralized error handling middleware
6. **Environment Config**: Sensitive data in .env files
