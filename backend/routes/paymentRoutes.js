const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  confirmPayment, 
  getPaymentByOrderId 
} = require('../controllers/paymentController');

// POST /api/payments/confirm - Confirm payment (protected — ownership checked in controller)
router.post('/confirm', verifyToken, confirmPayment);

// GET /api/payments/order/:order_id - Get payment by order ID (protected — ownership checked in controller)
router.get('/order/:order_id', verifyToken, getPaymentByOrderId);

module.exports = router;
