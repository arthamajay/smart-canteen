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

// GET /api/orders/vendor-stats - Today's vendor stats
router.get('/vendor-stats', verifyToken, async (req, res, next) => {
  try {
    const db = require('../config/database');
    const [consumed, pending] = await Promise.all([
      db.query("SELECT COUNT(*) FROM orders WHERE status='CONSUMED' AND DATE(consumed_at)=CURRENT_DATE"),
      db.query("SELECT COUNT(*) FROM orders WHERE status='PAID'")
    ]);
    res.json({ success: true, data: { todayConsumed: parseInt(consumed.rows[0].count), pendingPickup: parseInt(pending.rows[0].count) } });
  } catch(e) { next(e); }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders/verify - Verify order (for vendor)
router.post('/verify', verifyOrder);

module.exports = router;
