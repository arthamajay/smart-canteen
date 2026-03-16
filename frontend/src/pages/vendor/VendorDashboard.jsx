import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaQrcode, FaSignOutAlt, FaCheckCircle, FaClock, FaKeyboard } from 'react-icons/fa';
import QRScanner from '../../components/vendor/QRScanner';
import VerifyResult from '../../components/vendor/VerifyResult';
import { verifyOrder } from '../../services/api';
import api from '../../services/api';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [manualOrderId, setManualOrderId] = useState('');
  const [stats, setStats] = useState({ todayConsumed: 0, pendingPickup: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/vendor-stats');
      setStats(res.data.data || { todayConsumed: 0, pendingPickup: 0 });
    } catch {
      // silently fail — stats are non-critical
    }
  };

  const handleScan = async (scannedData) => {
    let orderId = scannedData;
    if (typeof scannedData === 'string') {
      const match = scannedData.match(/order[_-]?id[=:]?\s*(\d+)/i) || scannedData.match(/(\d+)/);
      if (match) orderId = match[match.length - 1];
    }
    setShowScanner(false);
    await handleVerify(orderId);
  };

  const handleVerify = async (orderId) => {
    try {
      setLoading(true);
      setResult(null);
      const response = await verifyOrder(orderId);
      setResult({ success: true, message: response.message, data: response.data });
      fetchStats();
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || err.response?.data?.error?.message || 'Verification failed',
        data: err.response?.data?.data || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualOrderId.trim()) {
      handleVerify(manualOrderId.trim());
      setManualOrderId('');
    }
  };

  if (result) {
    return (
      <div className="vendor-dashboard">
        <header className="vendor-header">
          <div className="header-brand"><span>🍽️</span><div><h1>Smart Canteen</h1><p>Vendor Portal — {user.name}</p></div></div>
          <button className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
        </header>
        <div className="vendor-body">
          <VerifyResult result={result} onVerifyAnother={() => setResult(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <header className="vendor-header">
        <div className="header-brand"><span>🍽️</span><div><h1>Smart Canteen</h1><p>Vendor Portal — {user.name}</p></div></div>
        <button className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
      </header>

      <div className="vendor-body">
        {/* Stats */}
        <div className="vendor-stats">
          <div className="vstat-card green">
            <FaCheckCircle className="vstat-icon" />
            <div><p className="vstat-label">Consumed Today</p><p className="vstat-value">{stats.todayConsumed}</p></div>
          </div>
          <div className="vstat-card orange">
            <FaClock className="vstat-icon" />
            <div><p className="vstat-label">Pending Pickup</p><p className="vstat-value">{stats.pendingPickup}</p></div>
          </div>
        </div>

        {showScanner ? (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        ) : (
          <div className="verify-options">
            <div className="option-card">
              <div className="option-icon qr"><FaQrcode /></div>
              <h2>Scan QR Code</h2>
              <p>Use camera to scan the student's QR code</p>
              <button className="opt-btn primary" onClick={() => setShowScanner(true)}>
                <FaQrcode /> Open Camera
              </button>
            </div>

            <div className="option-divider"><span>OR</span></div>

            <div className="option-card">
              <div className="option-icon manual"><FaKeyboard /></div>
              <h2>Enter Order ID</h2>
              <p>Type the order ID manually</p>
              <form onSubmit={handleManualVerify} className="manual-form">
                <input
                  type="number"
                  value={manualOrderId}
                  onChange={e => setManualOrderId(e.target.value)}
                  placeholder="e.g. 42"
                  disabled={loading}
                  min="1"
                />
                <button type="submit" className="opt-btn success" disabled={loading || !manualOrderId.trim()}>
                  {loading ? 'Verifying...' : 'Verify Order'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
