const db = require('../config/database');

class Payment {
  // Generate unique payment reference
  static generatePaymentRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }

  // Create payment record
  static async create(orderId, amount) {
    const paymentRef = this.generatePaymentRef();
    
    const query = `
      INSERT INTO payments (order_id, payment_ref, amount, status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING payment_id, order_id, payment_ref, amount, status, transaction_time, created_at
    `;
    
    const result = await db.query(query, [orderId, paymentRef, amount]);
    return result.rows[0];
  }

  // Update payment status
  static async updateStatus(paymentId, status) {
    const query = `
      UPDATE payments
      SET status = $1, transaction_time = CURRENT_TIMESTAMP
      WHERE payment_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, paymentId]);
    
    if (result.rows.length === 0) {
      throw new Error('Payment not found');
    }

    return result.rows[0];
  }

  // Get payment by order ID
  static async getByOrderId(orderId) {
    const query = `
      SELECT * FROM payments WHERE order_id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    return result.rows[0];
  }

  // Get payment by payment reference
  static async getByPaymentRef(paymentRef) {
    const query = `
      SELECT * FROM payments WHERE payment_ref = $1
    `;
    
    const result = await db.query(query, [paymentRef]);
    return result.rows[0];
  }

  // Verify payment exists and is successful
  static async verify(orderId) {
    const query = `
      SELECT 
        p.payment_id,
        p.order_id,
        p.payment_ref,
        p.amount,
        p.status as payment_status,
        p.transaction_time,
        o.status as order_status,
        o.total_amount
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE p.order_id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    
    if (result.rows.length === 0) {
      return { verified: false, message: 'Payment not found' };
    }

    const payment = result.rows[0];

    // Check if payment is successful
    if (payment.payment_status !== 'SUCCESS') {
      return { 
        verified: false, 
        message: `Payment status is ${payment.payment_status}`,
        payment 
      };
    }

    // Check if order is already consumed
    if (payment.order_status === 'CONSUMED') {
      return { 
        verified: false, 
        message: 'Order already consumed',
        payment 
      };
    }

    // Check if order is paid
    if (payment.order_status !== 'PAID') {
      return { 
        verified: false, 
        message: `Order status is ${payment.order_status}`,
        payment 
      };
    }

    return { 
      verified: true, 
      message: 'Payment verified successfully',
      payment 
    };
  }
}

module.exports = Payment;
