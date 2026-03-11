import React from 'react';
import './OrderForm.css';

const OrderForm = ({ cart, onRemoveItem, onUpdateQuantity, onPlaceOrder, loading }) => {
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="order-form">
        <h2 className="section-title">Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p className="empty-cart-hint">Add items from the menu to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-form">
      <h2 className="section-title">Your Cart ({cart.length} items)</h2>

      <div className="cart-items">
        {cart.map(item => (
          <div key={item.item_id} className="cart-item">
            <div className="cart-item-info">
              <h4 className="cart-item-name">{item.name}</h4>
              <p className="cart-item-price">₹{parseFloat(item.price).toFixed(2)} each</p>
            </div>

            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="qty-display">{item.quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="cart-item-subtotal">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>

              <button 
                className="remove-btn"
                onClick={() => onRemoveItem(item.item_id)}
                title="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <button 
        className="btn btn-primary btn-block"
        onClick={onPlaceOrder}
        disabled={loading}
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderForm;
