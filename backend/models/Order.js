const db = require('../config/database');

class Order {
  // Create new order with items
  static async create(userId, items, totalAmount) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Insert order
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status)
        VALUES ($1, $2, 'CREATED')
        RETURNING order_id, user_id, total_amount, status, created_at
      `;
      
      const orderResult = await client.query(orderQuery, [userId, totalAmount]);
      const order = orderResult.rows[0];

      // Insert order items
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const orderItems = [];
      for (const item of items) {
        const result = await client.query(orderItemsQuery, [
          order.order_id,
          item.item_id,
          item.quantity,
          item.price,
          item.subtotal
        ]);
        orderItems.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        items: orderItems
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order by ID with items
  static async getById(orderId) {
    const orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.total_amount,
        o.status,
        o.qr_code_data,
        o.created_at,
        o.updated_at,
        o.consumed_at,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
    `;
    
    const orderResult = await db.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.item_id,
        oi.quantity,
        oi.price_at_order,
        oi.subtotal,
        i.name as item_name,
        i.category
      FROM order_items oi
      JOIN items i ON oi.item_id = i.item_id
      WHERE oi.order_id = $1
    `;
    
    const itemsResult = await db.query(itemsQuery, [orderId]);
    order.items = itemsResult.rows;

    return order;
  }

  // Update order status
  static async updateStatus(orderId, newStatus, qrCodeData = null) {
    let query;
    let params;

    if (newStatus === 'CONSUMED') {
      query = `
        UPDATE orders
        SET status = $1, consumed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $2
        RETURNING *
      `;
      params = [newStatus, orderId];
    } else if (newStatus === 'PAID' && qrCodeData) {
      query = `
        UPDATE orders
        SET status = $1, qr_code_data = $2, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $3
        RETURNING *
      `;
      params = [newStatus, qrCodeData, orderId];
    } else {
      query = `
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $2
        RETURNING *
      `;
      params = [newStatus, orderId];
    }

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    return result.rows[0];
  }

  // Get order items for stock deduction
  static async getOrderItems(orderId) {
    const query = `
      SELECT item_id, quantity
      FROM order_items
      WHERE order_id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    return result.rows;
  }
}

module.exports = Order;
