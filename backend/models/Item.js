const db = require('../config/database');

class Item {
  // Get all available items
  static async getAll() {
    const query = `
      SELECT 
        item_id,
        name,
        description,
        price,
        stock_quantity,
        category,
        is_available,
        image_url,
        created_at,
        updated_at
      FROM items
      WHERE is_available = true
      ORDER BY category, name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get item by ID
  static async getById(itemId) {
    const query = `
      SELECT * FROM items WHERE item_id = $1
    `;
    
    const result = await db.query(query, [itemId]);
    return result.rows[0];
  }

  // Check if items are available and have sufficient stock
  static async checkAvailability(items) {
    const itemIds = items.map(item => item.item_id);
    
    const query = `
      SELECT item_id, name, stock_quantity, is_available, price
      FROM items
      WHERE item_id = ANY($1)
    `;
    
    const result = await db.query(query, [itemIds]);
    const dbItems = result.rows;

    // Validate each item
    for (const orderItem of items) {
      const dbItem = dbItems.find(i => i.item_id === orderItem.item_id);
      
      if (!dbItem) {
        throw new Error(`Item with ID ${orderItem.item_id} not found`);
      }
      
      if (!dbItem.is_available) {
        throw new Error(`Item "${dbItem.name}" is not available`);
      }
      
      if (dbItem.stock_quantity < orderItem.quantity) {
        throw new Error(`Insufficient stock for "${dbItem.name}". Available: ${dbItem.stock_quantity}`);
      }
    }

    return dbItems;
  }

  // Update stock quantity (called after order is consumed)
  static async updateStock(itemId, quantity) {
    const query = `
      UPDATE items
      SET stock_quantity = stock_quantity - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $2 AND stock_quantity >= $1
      RETURNING *
    `;
    
    const result = await db.query(query, [quantity, itemId]);
    
    if (result.rows.length === 0) {
      throw new Error('Insufficient stock or item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = Item;
