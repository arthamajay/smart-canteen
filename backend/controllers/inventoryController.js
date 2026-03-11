const Inventory = require('../models/Inventory');

// Get all stock levels
const getStockLevels = async (req, res, next) => {
  try {
    const stockLevels = await Inventory.getStockLevels();
    
    res.status(200).json({
      success: true,
      count: stockLevels.length,
      data: stockLevels
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock items
const getLowStockItems = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStockItems = await Inventory.getLowStockItems(threshold);
    
    res.status(200).json({
      success: true,
      threshold: threshold,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

// Update stock quantity (admin function)
const updateStockQuantity = async (req, res, next) => {
  try {
    const { item_id, quantity } = req.body;

    if (!item_id) {
      const error = new Error('item_id is required');
      error.statusCode = 400;
      throw error;
    }

    if (quantity === undefined || quantity === null) {
      const error = new Error('quantity is required');
      error.statusCode = 400;
      throw error;
    }

    if (quantity < 0) {
      const error = new Error('quantity cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    const updatedItem = await Inventory.updateStockQuantity(item_id, quantity);
    
    res.status(200).json({
      success: true,
      message: 'Stock quantity updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

// Check availability for multiple items
const checkAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('items array is required');
      error.statusCode = 400;
      throw error;
    }

    const availability = await Inventory.checkAvailability(items);
    
    res.status(200).json({
      success: true,
      allAvailable: availability.allValid,
      data: availability.items
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockLevels,
  getLowStockItems,
  updateStockQuantity,
  checkAvailability,
};
