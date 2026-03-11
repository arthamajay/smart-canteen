import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaQrcode, FaUser, FaSignOutAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import QRScanner from '../../components/vendor/QRScanner';
import VerifyResult from '../../components/vendor/VerifyResult';
import { verifyOrder } from '../../services/api';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [manualOrderId, setManualOrderId] = useState('');

  const handleScan = async (scannedData) => {
    console.log('Scanned data:', scannedData);
    
    // Extract order ID from scanned data
    let orderId = scannedData;
    
    // If scanned data is a URL or complex string, extract the order ID
    if (typeof scannedData === 'string') {
      // Try to extract number from string
      const match = scannedData.match(/\d+/);
      if (match) {
        orderId = match[0];
      }
    }

    setShowScanner(false);
    await handleVerify(orderId);
  };

  const handleVerify = async (orderId) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await verifyOrder(orderId);
      
      setResult({
        success: true,
        message: response.message,
        data: response.data,
      });
    } catch (err) {
      console.error('Verification error:', err);
      
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

  const handleVerifyAnother = () => {
    setResult(null);
  };

  if (result) {
    return (
      <div className="vendor-dashboard">
        <div className="dashboard-header">
          <h1>🍽️ Smart Canteen - Vendor</h1>
          <button onClick={logout} className="btn btn-secondary">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <VerifyResult result={result} onVerifyAnother={handleVerifyAnother} />
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🍽️ Smart Canteen</h1>
          <p className="welcome-text">Vendor Portal - {user.name}</p>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/vendor/profile')} className="btn btn-secondary">
            <FaUser /> Profile
          </button>
          <button onClick={logout} className="btn btn-danger">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {showScanner ? (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
        ) : (
          <div className="verify-options">
            <div className="option-card scan-option">
              <div className="option-icon">
                <FaQrcode />
              </div>
              <h2>Scan QR Code</h2>
              <p>Use your camera to scan the customer's QR code</p>
              <button 
                onClick={() => setShowScanner(true)} 
                className="btn btn-primary btn-large"
              >
                <FaQrcode /> Open Scanner
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="option-card manual-option">
              <div className="option-icon">
                <FaCheckCircle />
              </div>
              <h2>Manual Entry</h2>
              <p>Enter the order ID manually</p>
              
              <form onSubmit={handleManualVerify} className="manual-form">
                <input
                  type="text"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  placeholder="Enter Order ID"
                  className="order-input"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="btn btn-success btn-large"
                  disabled={loading || !manualOrderId.trim()}
                >
                  {loading ? 'Verifying...' : 'Verify Order'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="vendor-stats">
          <div className="stat-card">
            <div className="stat-icon success">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>Today's Orders</h3>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FaTimesCircle />
            </div>
            <div className="stat-info">
              <h3>Pending Pickup</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
