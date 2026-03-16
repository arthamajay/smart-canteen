import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaReceipt, FaCheckCircle, FaClock, FaQrcode, FaTimes } from 'react-icons/fa';
import { getOrderHistory } from '../../services/api';
import './OrderHistory.css';

// ── QR Modal ──────────────────────────────────────────────────────────────
const QRModal = ({ order, onClose }) => (
  <div className="qr-modal-overlay" onClick={onClose}>
    <div className="qr-modal-box" onClick={e => e.stopPropagation()}>
      <div className="qr-modal-header">
        <h3><FaQrcode /> Order #{order.order_id}</h3>
        <button className="qr-modal-close" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="qr-modal-body">
        {order.qr_code_data ? (
          <img src={order.qr_code_data} alt={`QR for order ${order.order_id}`} className="qr-modal-img" />
        ) : (
          <div className="qr-missing">QR code not available for this order.</div>
        )}
        <p className="qr-modal-hint">Show this to the vendor to collect your order</p>
        <div className="qr-modal-info">
          <span>Amount: <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong></span>
          {order.payment_ref && <span>Ref: <strong>{order.payment_ref}</strong></span>}
        </div>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [qrOrder, setQrOrder] = useState(null); // order whose QR is shown

  useEffect(() => {
    getOrderHistory()
      .then(res => setOrders(res.data || []))
      .catch(() => setError('Failed to load order history'))
      .finally(() => setLoading(false));
  }, []);

  const statusIcon = (status) => {
    if (status === 'CONSUMED') return <FaCheckCircle className="status-icon success" />;
    if (status === 'PAID')     return <FaClock className="status-icon warning" />;
    return <FaClock className="status-icon pending" />;
  };

  const statusClass = (status) => {
    if (status === 'CONSUMED') return 'status-badge success';
    if (status === 'PAID')     return 'status-badge warning';
    return 'status-badge pending';
  };

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'paid') return o.status === 'PAID';
    if (filter === 'consumed') return o.status === 'CONSUMED';
    return true;
  });

  if (loading) return (
    <div className="order-history-page">
      <div className="loading">Loading order history...</div>
    </div>
  );

  return (
    <div className="order-history-page">
      {/* QR Modal */}
      {qrOrder && <QRModal order={qrOrder} onClose={() => setQrOrder(null)} />}

      <div className="history-header">
        <button onClick={() => navigate('/student/dashboard')} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </button>
        <h1><FaReceipt /> Order History</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filter-tabs">
        {[['all','All Orders'],['paid','Ready for Pickup'],['consumed','Completed']].map(([val, label]) => (
          <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="no-orders">
          <FaReceipt className="no-orders-icon" />
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn btn-primary">Start Ordering</button>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order #{order.order_id}</strong>
                  {statusIcon(order.status)}
                </div>
                <span className={statusClass(order.status)}>{order.status}</span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(order.created_at).toLocaleString()}</span>
                </div>

                {order.items?.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Items:</span>
                    <div className="items-list">
                      {order.items.map((item, i) => (
                        <div key={i} className="item-row">
                          <span>{item.item_name} × {item.quantity}</span>
                          <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-row total">
                  <span className="label">Total:</span>
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
                    <span className="value">{new Date(order.consumed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {order.status === 'PAID' && (
                <div className="order-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => setQrOrder(order)}>
                    <FaQrcode /> View QR Code
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
