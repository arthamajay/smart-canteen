import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaReceipt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { getOrderHistory } from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'consumed'

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      // For now, we'll use the existing getOrderById for each order
      // In production, you'd have a dedicated order history endpoint
      const response = await getOrderHistory();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONSUMED':
        return <FaCheckCircle className="status-icon success" />;
      case 'PAID':
        return <FaClock className="status-icon warning" />;
      case 'CREATED':
        return <FaClock className="status-icon pending" />;
      default:
        return <FaTimesCircle className="status-icon error" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONSUMED':
        return 'status-badge success';
      case 'PAID':
        return 'status-badge warning';
      case 'CREATED':
        return 'status-badge pending';
      default:
        return 'status-badge error';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loading">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="history-header">
        <button onClick={() => navigate('/student/dashboard')} className="btn btn-secondary">
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1><FaReceipt /> Order History</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button
          className={`filter-tab ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Ready for Pickup
        </button>
        <button
          className={`filter-tab ${filter === 'consumed' ? 'active' : ''}`}
          onClick={() => setFilter('consumed')}
        >
          Completed
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <FaReceipt className="no-orders-icon" />
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn btn-primary">
            Start Ordering
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order #{order.order_id}</strong>
                  {getStatusIcon(order.status)}
                </div>
                <span className={getStatusClass(order.status)}>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Items:</span>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="item-row">
                          <span>{item.item_name} × {item.quantity}</span>
                          <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-row total">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>

                {order.payment_ref && (
                  <div className="detail-row">
                    <span className="label">Payment Ref:</span>
                    <span className="value">{order.payment_ref}</span>
                  </div>
                )}

                {order.consumed_at && (
                  <div className="detail-row">
                    <span className="label">Consumed At:</span>
                    <span className="value">
                      {new Date(order.consumed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {order.status === 'PAID' && (
                <div className="order-actions">
                  <button className="btn btn-primary btn-sm">
                    View QR Code
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
