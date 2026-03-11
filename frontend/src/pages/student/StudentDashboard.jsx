import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShoppingCart, FaHistory, FaUser, FaSignOutAlt, FaReceipt } from 'react-icons/fa';
import ItemList from '../../components/student/ItemList';
import OrderForm from '../../components/student/OrderForm';
import OrderConfirm from '../../components/student/OrderConfirm';
import { createOrder, confirmPayment } from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [activeTab, setActiveTab] = useState('order'); // 'order' or 'browse'

  const handleAddToCart = (item, quantityChange) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item_id === item.item_id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        
        if (newQuantity <= 0) {
          return prevCart.filter(cartItem => cartItem.item_id !== item.item_id);
        }
        
        return prevCart.map(cartItem =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        return [...prevCart, {
          item_id: item.item_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: quantityChange,
        }];
      }
    });
  };

  const handleRemoveItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.item_id !== itemId));
  };

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

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderItems = cart.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
      }));

      const orderResponse = await createOrder(user.user_id, orderItems);
      const orderId = orderResponse.data.order_id;

      const paymentResponse = await confirmPayment(orderId);
      setOrderData(paymentResponse.data);
      setCart([]);
    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setOrderData(null);
    setError(null);
    setActiveTab('browse');
  };

  if (orderData) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>🍽️ Smart Canteen</h1>
          <button onClick={logout} className="btn btn-secondary">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <OrderConfirm orderData={orderData} onNewOrder={handleNewOrder} />
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🍽️ Smart Canteen</h1>
          <p className="welcome-text">Welcome, {user.name}!</p>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/student/history')} className="btn btn-secondary">
            <FaHistory /> Order History
          </button>
          <button onClick={() => navigate('/student/profile')} className="btn btn-secondary">
            <FaUser /> Profile
          </button>
          <button onClick={logout} className="btn btn-danger">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      <div className="dashboard-content">
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

export default StudentDashboard;
