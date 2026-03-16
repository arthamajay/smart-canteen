import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goHome = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'student') navigate('/student/dashboard');
    else if (user.role === 'vendor') navigate('/vendor/dashboard');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Access Denied</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>You don't have permission to view this page.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={goHome} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Go to Dashboard
          </button>
          <button onClick={logout} style={{ padding: '0.75rem 1.5rem', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
