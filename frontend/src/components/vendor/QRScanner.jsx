import React, { useState } from 'react';
import { QrReader} from 'react-qr-reader';
import { FaCamera, FaTimes, FaQrcode } from 'react-icons/fa';
import './QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = (result, error) => {
    if (result) {
      // Extract order ID from QR code data
      const orderId = result?.text || result;
      console.log('QR Code scanned:', orderId);
      
      // Call parent callback with order ID
      onScan(orderId);
      setScanning(false);
    }

    if (error) {
      console.error('QR Scan error:', error);
      // Don't show error for every frame, only critical errors
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
      }
    }
  };

  const handleError = (err) => {
    console.error('Camera error:', err);
    setError('Failed to access camera. Please check permissions.');
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
  };

  const stopScanning = () => {
    setScanning(false);
    setError(null);
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h2><FaQrcode /> Scan QR Code</h2>
        <button onClick={onClose} className="close-button">
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="scanner-error">
          {error}
        </div>
      )}

      {!scanning ? (
        <div className="scanner-placeholder">
          <FaCamera className="camera-icon" />
          <h3>Ready to Scan</h3>
          <p>Click the button below to start scanning QR codes</p>
          <button onClick={startScanning} className="btn btn-primary btn-large">
            <FaCamera /> Start Camera
          </button>
        </div>
      ) : (
        <div className="scanner-active">
          <div className="scanner-frame">
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              style={{ width: '100%' }}
            />
            <div className="scanner-overlay">
              <div className="scanner-box"></div>
            </div>
          </div>
          
          <div className="scanner-instructions">
            <p>Position the QR code within the frame</p>
            <button onClick={stopScanning} className="btn btn-secondary">
              Stop Scanning
            </button>
          </div>
        </div>
      )}

      <div className="scanner-tips">
        <h4>Tips for better scanning:</h4>
        <ul>
          <li>Hold the device steady</li>
          <li>Ensure good lighting</li>
          <li>Keep QR code within the frame</li>
          <li>Avoid glare and reflections</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
