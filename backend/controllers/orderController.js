const Order = require('../models/Order');
const Item = require('../models/Item');
const Payment = require('../models/Payment');
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

    // Check item availability and stock
    const dbItems = await Item.checkAvailability(items);

    // Calculate total amount and prepare items with prices
    let totalAmount = 0;
    const orderItems = items.map(orderItem => {
      const dbItem = dbItems.find(i => i.item_id === orderItem.item_id);
      const subtotal = dbItem.price * orderItem.quantity;
      totalAmount += subtotal;

      return {
        item_id: orderItem.item_id,
        quantity: orderItem.quantity,
        price: dbItem.price,
        subtotal: subtotal
      };
    });

    // Create order
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

    // Deduct stock for each item
    const orderItems = await Order.getOrderItems(order_id);
    for (const item of orderItems) {
      await Item.updateStock(item.item_id, item.quantity);
    }

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

module.exports = {
  createOrder,
  getOrderById,
  verifyOrder,
};
