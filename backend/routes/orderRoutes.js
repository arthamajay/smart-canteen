const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  verifyOrder,
  getOrderHistory
} = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/orders/create - Create new order (protected)
router.post('/create', verifyToken, createOrder);

// GET /api/orders/history - Get order history (protected)
router.get('/history', verifyToken, getOrderHistory);

// GET /api/orders/vendor-stats - Today's vendor stats (vendor only)
router.get('/vendor-stats', verifyToken, requireRole('vendor'), async (req, res, next) => {
  try {
    const db = require('../config/database');
    const [consumed, pending] = await Promise.all([
      db.query("SELECT COUNT(*) FROM orders WHERE status='CONSUMED' AND DATE(consumed_at)=CURRENT_DATE"),
      db.query("SELECT COUNT(*) FROM orders WHERE status='PAID'")
    ]);
    res.json({ success: true, data: { todayConsumed: parseInt(consumed.rows[0].count), pendingPickup: parseInt(pending.rows[0].count) } });
  } catch(e) { next(e); }
});

// GET /api/orders/:id - Get order by ID (protected — ownership checked in controller)
router.get('/:id', verifyToken, getOrderById);

// POST /api/orders/verify - Verify order (vendor only)
router.post('/verify', verifyToken, requireRole('vendor'), verifyOrder);

module.exports = router;
