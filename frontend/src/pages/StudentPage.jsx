import React, { useState } from 'react';
import ItemList from '../components/student/ItemList';
import OrderForm from '../components/student/OrderForm';
import OrderConfirm from '../components/student/OrderConfirm';
import { createOrder, confirmPayment } from '../services/api';
import './StudentPage.css';

const StudentPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Hardcoded user_id for MVP (no authentication)
  const USER_ID = 1;

  // Add item to cart or update quantity
  const handleAddToCart = (item, quantityChange) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item_id === item.item_id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        
        if (newQuantity <= 0) {
          // Remove item if quantity becomes 0 or negative
          return prevCart.filter(cartItem => cartItem.item_id !== item.item_id);
        }
        
        // Update quantity
        return prevCart.map(cartItem =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // Add new item
        return [...prevCart, {
          item_id: item.item_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: quantityChange,
        }];
      }
    });
  };

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.item_id !== itemId));
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Place order and process payment
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare items for API
      const orderItems = cart.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
      }));

      // Create order
      const orderResponse = await createOrder(USER_ID, orderItems);
      const orderId = orderResponse.data.order_id;

      // Confirm payment (simulate)
      const paymentResponse = await confirmPayment(orderId);

      // Set order data to show confirmation
      setOrderData(paymentResponse.data);

      // Clear cart
      setCart([]);
    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Start new order
  const handleNewOrder = () => {
    setOrderData(null);
    setError(null);
  };

  // If order is confirmed, show confirmation page
  if (orderData) {
    return (
      <div className="student-page">
        <OrderConfirm orderData={orderData} onNewOrder={handleNewOrder} />
      </div>
    );
  }

  return (
    <div className="student-page">
      <h1 className="page-title">Student Portal - Order Food</h1>

      {error && (
        <div className="error">
          {error}
          <button 
            className="btn btn-secondary" 
            onClick={() => setError(null)}
            style={{ marginLeft: '15px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="student-layout">
        <div className="items-section">
          <ItemList onAddToCart={handleAddToCart} cart={cart} />
        </div>

        <div className="cart-section">
          <OrderForm
            cart={cart}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onPlaceOrder={handlePlaceOrder}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
