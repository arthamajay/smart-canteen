const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { generateQRCode } = require('../utils/qrGenerator');

// Simulate payment and confirm
const confirmPayment = async (req, res, next) => {
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

    // Check if order is in CREATED status
    if (order.status !== 'CREATED') {
      const error = new Error(`Cannot process payment. Order status is ${order.status}`);
      error.statusCode = 400;
      throw error;
    }

    // Check if payment already exists
    let payment = await Payment.getByOrderId(order_id);

    if (payment) {
      // Payment already exists, check status
      if (payment.status === 'SUCCESS') {
        const error = new Error('Payment already completed for this order');
        error.statusCode = 400;
        throw error;
      }
      
      // Update existing payment to SUCCESS
      payment = await Payment.updateStatus(payment.payment_id, 'SUCCESS');
    } else {
      // Create new payment
      payment = await Payment.create(order_id, order.total_amount);
      
      // Simulate payment success (in real app, this would be async callback from payment gateway)
      payment = await Payment.updateStatus(payment.payment_id, 'SUCCESS');
    }

    // Generate QR code with order_id
    const qrCodeData = order_id.toString();
    const qrCodeImage = await generateQRCode(qrCodeData);

    // Update order status to PAID and store the full base64 QR image
    const updatedOrder = await Order.updateStatus(order_id, 'PAID', qrCodeImage);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        order_id: updatedOrder.order_id,
        payment_ref: payment.payment_ref,
        amount: payment.amount,
        status: updatedOrder.status,
        qr_code: qrCodeImage,
        transaction_time: payment.transaction_time
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get payment details by order ID
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const payment = await Payment.getByOrderId(order_id);

    if (!payment) {
      const error = new Error('Payment not found for this order');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  confirmPayment,
  getPaymentByOrderId,
};
