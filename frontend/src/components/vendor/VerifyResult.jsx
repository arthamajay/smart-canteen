import React from 'react';
import './VerifyResult.css';

const VerifyResult = ({ result, onVerifyAnother }) => {
  const { success, message, data } = result;

  return (
    <div className="verify-result">
      <div className={`result-icon ${success ? 'success' : 'error'}`}>
        {success ? '✓' : '✗'}
      </div>

      <h2 className={`result-title ${success ? 'success' : 'error'}`}>
        {success ? 'Order Verified Successfully!' : 'Verification Failed'}
      </h2>

      <div className={`result-message ${success ? 'success' : 'error'}`}>
        {message}
      </div>

      {data && (
        <div className="order-info">
          <h3>Order Details</h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Order ID:</span>
              <span className="info-value">{data.order_id}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value status status-${data.status?.toLowerCase()}`}>
                {data.status}
              </span>
            </div>

            {data.consumed_at && (
              <div className="info-item">
                <span className="info-label">Consumed At:</span>
                <span className="info-value">
                  {new Date(data.consumed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {data.items && data.items.length > 0 && (
            <div className="items-section">
              <h4>Order Items:</h4>
              <div className="items-list">
                {data.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <span className="item-name">{item.item_name}</span>
                    <span className="item-quantity">×{item.quantity}</span>
                    <span className="item-subtotal">
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={onVerifyAnother}>
          Verify Another Order
        </button>
      </div>

      {success && (
        <div className="success-instructions">
          <h4>✓ Order Completed</h4>
          <p>You can now hand over the order to the customer.</p>
          <p>Stock has been automatically deducted.</p>
        </div>
      )}

      {!success && (
        <div className="error-instructions">
          <h4>Common Issues:</h4>
          <ul>
            <li>Order ID not found - Check if customer entered correct ID</li>
            <li>Order not paid - Customer needs to complete payment first</li>
            <li>Order already consumed - This order was already picked up</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerifyResult;
