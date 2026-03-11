const db = require('../config/database');

class Inventory {
  /**
   * Reserve stock for an order (atomic operation)
   * This prevents overselling when multiple orders happen simultaneously
   */
  static async reserveStock(items, client = null) {
    const useClient = client || db;
    
    try {
      // Lock rows for update to prevent race conditions
      const itemIds = items.map(item => item.item_id);
      const lockQuery = `
        SELECT item_id, name, stock_quantity, is_available
        FROM items
        WHERE item_id = ANY($1)
        FOR UPDATE
      `;
      
      const result = await useClient.query(lockQuery, [itemIds]);
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
          throw new Error(
            `Insufficient stock for "${dbItem.name}". ` +
            `Requested: ${orderItem.quantity}, Available: ${dbItem.stock_quantity}`
          );
        }
      }

      // Reserve stock (deduct immediately)
      for (const orderItem of items) {
        const updateQuery = `
          UPDATE items
          SET stock_quantity = stock_quantity - $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE item_id = $2 AND stock_quantity >= $1
          RETURNING item_id, name, stock_quantity
        `;
        
        const updateResult = await useClient.query(updateQuery, [
          orderItem.quantity,
          orderItem.item_id
        ]);

        if (updateResult.rows.length === 0) {
          throw new Error(
            `Failed to reserve stock for item ID ${orderItem.item_id}. ` +
            `Possible concurrent order conflict.`
          );
        }
      }

      return { success: true, message: 'Stock reserved successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Release reserved stock (rollback)
   * Used when order creation fails after stock reservation
   */
  static async releaseStock(items, client = null) {
    const useClient = client || db;
    
    try {
      for (const item of items) {
        const query = `
          UPDATE items
          SET stock_quantity = stock_quantity + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE item_id = $2
          RETURNING item_id, name, stock_quantity
        `;
        
        await useClient.query(query, [item.quantity, item.item_id]);
      }

      return { success: true, message: 'Stock released successfully' };
    } catch (error) {
      console.error('Error releasing stock:', error);
      throw error;
    }
  }

  /**
   * Check stock availability without locking
   * Used for display purposes
   */
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
    const validation = [];
    for (const orderItem of items) {
      const dbItem = dbItems.find(i => i.item_id === orderItem.item_id);
      
      if (!dbItem) {
        validation.push({
          item_id: orderItem.item_id,
          valid: false,
          reason: 'Item not found'
        });
        continue;
      }
      
      if (!dbItem.is_available) {
        validation.push({
          item_id: orderItem.item_id,
          name: dbItem.name,
          valid: false,
          reason: 'Item not available'
        });
        continue;
      }
      
      if (dbItem.stock_quantity < orderItem.quantity) {
        validation.push({
          item_id: orderItem.item_id,
          name: dbItem.name,
          valid: false,
          reason: `Insufficient stock. Available: ${dbItem.stock_quantity}, Requested: ${orderItem.quantity}`
        });
        continue;
      }

      validation.push({
        item_id: orderItem.item_id,
        name: dbItem.name,
        valid: true,
        available_stock: dbItem.stock_quantity
      });
    }

    return {
      allValid: validation.every(v => v.valid),
      items: validation,
      dbItems: dbItems
    };
  }

  /**
   * Get low stock items (for alerts)
   */
  static async getLowStockItems(threshold = 10) {
    const query = `
      SELECT item_id, name, stock_quantity, category
      FROM items
      WHERE stock_quantity <= $1 AND is_available = true
      ORDER BY stock_quantity ASC
    `;
    
    const result = await db.query(query, [threshold]);
    return result.rows;
  }

  /**
   * Update stock quantity directly (admin function)
   */
  static async updateStockQuantity(itemId, newQuantity) {
    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const query = `
      UPDATE items
      SET stock_quantity = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [newQuantity, itemId]);
    
    if (result.rows.length === 0) {
      throw new Error('Item not found');
    }

    return result.rows[0];
  }

  /**
   * Get stock history (if we add a stock_history table in future)
   * For now, returns current stock levels
   */
  static async getStockLevels() {
    const query = `
      SELECT 
        item_id,
        name,
        category,
        stock_quantity,
        price,
        is_available,
        updated_at
      FROM items
      ORDER BY category, name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Inventory;
