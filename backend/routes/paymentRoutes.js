const express = require('express');
const router = express.Router();
const { 
  confirmPayment, 
  getPaymentByOrderId 
} = require('../controllers/paymentController');

// POST /api/payments/confirm - Confirm payment (simulate payment)
router.post('/confirm', confirmPayment);

// GET /api/payments/order/:order_id - Get payment by order ID
router.get('/order/:order_id', getPaymentByOrderId);

module.exports = router;
