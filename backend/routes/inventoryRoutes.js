const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getStockLevels,
  getLowStockItems,
  updateStockQuantity,
  checkAvailability,
} = require('../controllers/inventoryController');

// GET /api/inventory/stock-levels - Get all stock levels (admin/vendor only)
router.get('/stock-levels', verifyToken, requireRole('admin', 'vendor'), getStockLevels);

// GET /api/inventory/low-stock - Get low stock items (admin/vendor only)
router.get('/low-stock', verifyToken, requireRole('admin', 'vendor'), getLowStockItems);

// POST /api/inventory/update-stock - Update stock quantity (admin only)
router.post('/update-stock', verifyToken, requireRole('admin'), updateStockQuantity);

// POST /api/inventory/check-availability - Check item availability (authenticated users)
router.post('/check-availability', verifyToken, checkAvailability);

module.exports = router;
