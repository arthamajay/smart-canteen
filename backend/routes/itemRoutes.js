const express = require('express');
const router = express.Router();
const { getAllItems, getItemById } = require('../controllers/itemController');

// GET /api/items - Get all available items
router.get('/', getAllItems);

// GET /api/items/:id - Get item by ID
router.get('/:id', getItemById);

module.exports = router;
