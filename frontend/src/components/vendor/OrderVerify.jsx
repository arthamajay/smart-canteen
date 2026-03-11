import React, { useState } from 'react';
import './OrderVerify.css';

const OrderVerify = ({ onVerify, loading }) => {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      onVerify(orderId.trim());
    }
  };

  return (
    <div className="order-verify">
      <h2 className="section-title">Verify Order</h2>
      
      <div className="verify-container">
        <div className="verify-instructions">
          <h3>How to verify:</h3>
          <ul>
            <li>Ask customer to show QR code</li>
            <li>Scan QR code or manually enter Order ID</li>
            <li>Click "Verify Order" button</li>
            <li>Check verification result</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="form-group">
            <label htmlFor="orderId">Order ID</label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g., 1, 2, 3...)"
              disabled={loading}
              autoFocus
            />
            <p className="input-hint">
              Enter the Order ID shown on customer's screen or scanned from QR code
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || !orderId.trim()}
          >
            {loading ? 'Verifying...' : 'Verify Order'}
          </button>
        </form>

        <div className="qr-scanner-placeholder">
          <div className="scanner-icon">📷</div>
          <p>QR Scanner</p>
          <p className="scanner-note">
            (QR scanning feature can be integrated using a library like react-qr-reader)
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderVerify;
