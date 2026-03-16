const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getStats, getVendors, createVendor, toggleVendorStatus,
  getStudents, getItems, createItem, updateItem, deleteItem, getAnalytics
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

router.get('/stats', getStats);
router.get('/vendors', getVendors);
router.post('/vendors', createVendor);
router.put('/vendors/:id/toggle', toggleVendorStatus);
router.get('/students', getStudents);
router.get('/items', getItems);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.get('/analytics', getAnalytics);

module.exports = router;
