import React, { useState, useRef } from 'react';
import { QrReader} from 'react-qr-reader';
import { FaCamera, FaTimes, FaQrcode } from 'react-icons/fa';
import './QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannedRef = useRef(false); // gate — fires only once per scan session

  const handleScan = (result, err) => {
    // Ignore if already handled this scan session
    if (scannedRef.current) return;

    if (result) {
      scannedRef.current = true; // lock immediately so no more frames trigger this
      const orderId = result?.text || result;
      console.log('QR Code scanned:', orderId);
      setScanning(false);
      onScan(orderId);
    }

    if (err && err.name === 'NotAllowedError') {
      setError('Camera permission denied. Please allow camera access.');
    }
  };

  const startScanning = () => {
    scannedRef.current = false; // reset gate for new session
    setError(null);
    setScanning(true);
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
