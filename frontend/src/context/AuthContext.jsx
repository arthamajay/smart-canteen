import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // SECURITY: Override role & user_id from the JWT payload, NOT from
          // localStorage. localStorage is client-editable via DevTools — a
          // student can change their role to "admin" and access admin pages.
          // The JWT is server-signed and cannot be forged without JWT_SECRET,
          // so the role inside it is trustworthy.
          try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            parsedUser.role = payload.role;
            parsedUser.user_id = payload.user_id;
          } catch {
            // Token is malformed — treat as unauthenticated
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
          setUser(parsedUser);
          api.setAuthToken(token);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      const { user: userData, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth token for future requests
      api.setAuthToken(token);

      // Update state
      setUser(userData);

      // Redirect based on role
      switch (userData.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Login failed'
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.registerStudent(formData);
      const { user: userData, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth token
      api.setAuthToken(token);

      // Update state
      setUser(userData);

      // Redirect to student dashboard
      navigate('/student/dashboard');

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    // Blacklist the token on the backend so it can't be reused after logout
    try {
      await api.logout();
    } catch {
      // Proceed with local logout even if the API call fails
    }

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear auth token
    api.setAuthToken(null);

    // Clear state
    setUser(null);

    // Redirect to login
    navigate('/login');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isVendor: user?.role === 'vendor',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
