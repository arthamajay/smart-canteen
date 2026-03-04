const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  verifyOrder 
} = require('../controllers/orderController');

// POST /api/orders/create - Create new order
router.post('/create', createOrder);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders/verify - Verify order (for vendor)
router.post('/verify', verifyOrder);

module.exports = router;
