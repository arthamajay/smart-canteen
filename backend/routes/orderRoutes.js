const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  verifyOrder,
  getOrderHistory
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// POST /api/orders/create - Create new order (protected)
router.post('/create', verifyToken, createOrder);

// GET /api/orders/history - Get order history (protected)
router.get('/history', verifyToken, getOrderHistory);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders/verify - Verify order (for vendor)
router.post('/verify', verifyOrder);

module.exports = router;
