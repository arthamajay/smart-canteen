import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Load token from localStorage on init
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized — but NOT for password-change (wrong current password)
    const url = error.config?.url || '';
    const isPasswordChange = url.includes('change-password');

    if (error.response?.status === 401 && !isPasswordChange) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// Authentication API
// ============================================

export const registerStudent = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

// ============================================
// Items API
// ============================================

export const getAllItems = async () => {
  const response = await api.get('/items');
  return response.data;
};

export const getItemById = async (itemId) => {
  const response = await api.get(`/items/${itemId}`);
  return response.data;
};

// ============================================
// Orders API
// ============================================

export const createOrder = async (userId, items) => {
  const response = await api.post('/orders/create', {
    user_id: userId,
    items: items,
  });
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const verifyOrder = async (orderId) => {
  const response = await api.post('/orders/verify', {
    order_id: orderId,
  });
  return response.data;
};

// ============================================
// Payments API
// ============================================

export const confirmPayment = async (orderId) => {
  const response = await api.post('/payments/confirm', {
    order_id: orderId,
  });
  return response.data;
};

export const getPaymentByOrderId = async (orderId) => {
  const response = await api.get(`/payments/order/${orderId}`);
  return response.data;
};

export default api;

// ============================================
// Order History API
// ============================================

export const getOrderHistory = async () => {
  const response = await api.get('/orders/history');
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ============================================
// Admin API
// ============================================

export const getAdminStats = () => api.get('/admin/stats').then(r => r.data);
export const getAdminVendors = () => api.get('/admin/vendors').then(r => r.data);
export const createVendor = (data) => api.post('/admin/vendors', data).then(r => r.data);
export const toggleVendorStatus = (id) => api.put(`/admin/vendors/${id}/toggle`).then(r => r.data);
export const getAdminStudents = () => api.get('/admin/students').then(r => r.data);
export const getAdminItems = () => api.get('/admin/items').then(r => r.data);
export const createAdminItem = (data) => api.post('/admin/items', data).then(r => r.data);
export const updateAdminItem = (id, data) => api.put(`/admin/items/${id}`, data).then(r => r.data);
export const deleteAdminItem = (id) => api.delete(`/admin/items/${id}`).then(r => r.data);
export const getAnalytics = () => api.get('/admin/analytics').then(r => r.data);
