import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaCamera, FaTimes, FaQrcode } from 'react-icons/fa';
import './QRScanner.css';

const QR_ELEMENT_ID = 'qr-reader-element';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);

  const startScanning = async () => {
    scannedRef.current = false;
    setError(null);
    setScanning(true);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode(QR_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (scannedRef.current) return;
        scannedRef.current = true;
        stopScanning();
        onScan(decodedText);
      },
      () => {} // ignore per-frame errors
    ).catch((err) => {
      setError('Camera access denied. Please allow camera permission.');
      setScanning(false);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h2><FaQrcode /> Scan QR Code</h2>
        <button onClick={onClose} className="close-button"><FaTimes /></button>
      </div>

      {error && <div className="scanner-error">{error}</div>}

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
            <div id={QR_ELEMENT_ID} style={{ width: '100%' }} />
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
