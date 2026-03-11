import React, { useState } from 'react';
import OrderVerify from '../components/vendor/OrderVerify';
import VerifyResult from '../components/vendor/VerifyResult';
import { verifyOrder } from '../services/api';
import './VendorPage.css';

const VendorPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  const handleVerifyAnother = () => {
    setResult(null);
  };

  return (
    <div className="vendor-page">
      <h1 className="page-title">Vendor Portal - Verify Orders</h1>

      {!result ? (
        <OrderVerify onVerify={handleVerify} loading={loading} />
      ) : (
        <VerifyResult result={result} onVerifyAnother={handleVerifyAnother} />
      )}
    </div>
  );
};

export default VendorPage;
