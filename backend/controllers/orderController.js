const Order = require('../models/Order');
const Item = require('../models/Item');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const db = require('../config/database');
const { generateQRCode } = require('../utils/qrGenerator');
const { validateOrderItems, isValidStatusTransition } = require('../utils/validators');

// Create new order
const createOrder = async (req, res, next) => {
  try {
    const { user_id, items } = req.body;

    // Validate input
    if (!user_id) {
      const error = new Error('user_id is required');
      error.statusCode = 400;
      throw error;
    }

    const validation = validateOrderItems(items);
    if (!validation.valid) {
      const error = new Error(validation.message);
      error.statusCode = 400;
      throw error;
    }

    // Check item availability (without locking)
    const availabilityCheck = await Inventory.checkAvailability(items);
    
    if (!availabilityCheck.allValid) {
      const invalidItems = availabilityCheck.items.filter(i => !i.valid);
      const errorMessages = invalidItems.map(i => `${i.name || 'Item ' + i.item_id}: ${i.reason}`);
      const error = new Error(errorMessages.join('; '));
      error.statusCode = 400;
      throw error;
    }

    // Calculate total amount and prepare items with prices
    let totalAmount = 0;
    const orderItems = items.map(orderItem => {
      const dbItem = availabilityCheck.dbItems.find(i => i.item_id === orderItem.item_id);
      const subtotal = dbItem.price * orderItem.quantity;
      totalAmount += subtotal;

      return {
        item_id: orderItem.item_id,
        quantity: orderItem.quantity,
        price: dbItem.price,
        subtotal: subtotal
      };
    });

    // Create order (this will reserve stock atomically)
    const order = await Order.create(user_id, orderItems, totalAmount);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.getById(id);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Verify order (for vendor)
const verifyOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      const error = new Error('order_id is required');
      error.statusCode = 400;
      throw error;
    }

    // Get order details
    const order = await Order.getById(order_id);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify payment
    const verification = await Payment.verify(order_id);

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: verification.message,
        data: {
          order_id: order.order_id,
          status: order.status,
          payment_status: verification.payment?.payment_status
        }
      });
    }

    // Check if order can be consumed
    if (order.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be consumed. Current status: ${order.status}`,
        data: order
      });
    }

    // Mark order as consumed
    const updatedOrder = await Order.updateStatus(order_id, 'CONSUMED');

    // Note: Stock was already deducted during order creation
    // This is the new behavior in Phase 4 - stock is reserved immediately
    // No need to deduct again here

    res.status(200).json({
      success: true,
      message: 'Order verified and marked as consumed',
      data: {
        order_id: updatedOrder.order_id,
        status: updatedOrder.status,
        consumed_at: updatedOrder.consumed_at,
        items: order.items
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get order history for current user
const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const query = `
      SELECT 
        o.order_id,
        o.user_id,
        o.total_amount,
        o.status,
        o.qr_code_data,
        o.created_at,
        o.consumed_at,
        p.payment_ref,
        p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.order_id = p.order_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    const orders = result.rows;

    // Get items for each order
    for (let order of orders) {
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
      
      const itemsResult = await db.query(itemsQuery, [order.order_id]);
      order.items = itemsResult.rows;
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  verifyOrder,
  getOrderHistory,
};
