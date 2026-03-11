import React from 'react';
import './OrderConfirm.css';

const OrderConfirm = ({ orderData, onNewOrder }) => {
  const { order_id, payment_ref, qr_code, amount, status } = orderData;

  return (
    <div className="order-confirm">
      <div className="success-icon">✓</div>
      
      <h2 className="confirm-title">Order Placed Successfully!</h2>
      
      <div className="order-details">
        <div className="detail-row">
          <span className="detail-label">Order ID:</span>
          <span className="detail-value order-id">{order_id}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Payment Reference:</span>
          <span className="detail-value">{payment_ref}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Amount Paid:</span>
          <span className="detail-value amount">₹{parseFloat(amount).toFixed(2)}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className={`detail-value status status-${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="qr-section">
        <h3 className="qr-title">Show this QR Code to the vendor</h3>
        <div className="qr-container">
          <img src={qr_code} alt="Order QR Code" className="qr-image" />
        </div>
        <p className="qr-hint">
          The vendor will scan this code to verify and complete your order
        </p>
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={onNewOrder}>
          Place New Order
        </button>
      </div>

      <div className="instructions">
        <h4>Next Steps:</h4>
        <ol>
          <li>Show this QR code to the canteen vendor</li>
          <li>Vendor will scan or enter your Order ID</li>
          <li>Once verified, collect your order</li>
          <li>Enjoy your meal! 🍽️</li>
        </ol>
      </div>
    </div>
  );
};

export default OrderConfirm;
