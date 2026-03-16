import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import OrderHistory from './pages/student/OrderHistory';
import StudentProfile from './pages/student/StudentProfile';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <OrderHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentProfile />
                </PrivateRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <PrivateRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
