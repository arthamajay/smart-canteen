const express = require('express');
const router = express.Router();
const {
  getStockLevels,
  getLowStockItems,
  updateStockQuantity,
  checkAvailability,
} = require('../controllers/inventoryController');

// GET /api/inventory/stock-levels - Get all stock levels
router.get('/stock-levels', getStockLevels);

// GET /api/inventory/low-stock - Get low stock items
router.get('/low-stock', getLowStockItems);

// POST /api/inventory/update-stock - Update stock quantity (admin)
router.post('/update-stock', updateStockQuantity);

// POST /api/inventory/check-availability - Check item availability
router.post('/check-availability', checkAvailability);

module.exports = router;
