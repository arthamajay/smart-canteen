const Item = require('../models/Item');

// Get all available items
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.getAll();
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// Get item by ID
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.getById(id);
    
    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllItems,
  getItemById,
};
