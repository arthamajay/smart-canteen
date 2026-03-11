import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUsers, 
  FaUserTie, 
  FaBoxes, 
  FaChartLine, 
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // TODO: Implement API call to fetch stats
    // For now, using dummy data
    setStats({
      totalStudents: 150,
      totalVendors: 5,
      totalOrders: 1250,
      totalRevenue: 45000,
      todayOrders: 45,
      todayRevenue: 1800
    });
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FaUserTie />
          </div>
          <div className="stat-content">
            <h3>Total Vendors</h3>
            <p className="stat-value">{stats.totalVendors}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="today-stats">
        <h3>Today's Performance</h3>
        <div className="today-grid">
          <div className="today-card">
            <span className="label">Orders Today</span>
            <span className="value">{stats.todayOrders}</span>
          </div>
          <div className="today-card">
            <span className="label">Revenue Today</span>
            <span className="value">₹{stats.todayRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setActiveTab('vendors')}
          >
            <FaPlus /> Add Vendor
          </button>
          <button 
            className="action-btn success"
            onClick={() => setActiveTab('inventory')}
          >
            <FaBoxes /> Manage Inventory
          </button>
          <button 
            className="action-btn info"
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartLine /> View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  const renderVendorManagement = () => (
    <div className="vendor-management">
      <div className="section-header">
        <h2>Vendor Management</h2>
        <button className="btn btn-primary">
          <FaPlus /> Add New Vendor
        </button>
      </div>
      
      <div className="info-message">
        <p>Vendor management interface will be implemented here.</p>
        <p>Features: Add, Edit, Deactivate vendors, View activity logs</p>
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className="inventory-management">
      <div className="section-header">
        <h2>Inventory Management</h2>
        <button className="btn btn-primary">
          <FaPlus /> Add New Item
        </button>
      </div>
      
      <div className="info-message">
        <p>Inventory management interface will be implemented here.</p>
        <p>Features: Add items, Update stock, Set prices, Manage availability</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-section">
      <h2>Analytics & Reports</h2>
      
      <div className="info-message">
        <p>Analytics dashboard will be implemented here.</p>
        <p>Features: Sales charts, Popular items, Peak hours, Revenue trends</p>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🛡️ Admin Portal</h1>
          <p className="welcome-text">Welcome, {user.name}</p>
        </div>
        <div className="header-right">
          <button onClick={logout} className="btn btn-danger">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine /> Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendors')}
            >
              <FaUserTie /> Vendors
            </button>
            <button
              className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <FaBoxes /> Inventory
            </button>
            <button
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <FaChartLine /> Analytics
            </button>
          </nav>
        </div>

        <div className="main-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'vendors' && renderVendorManagement()}
          {activeTab === 'inventory' && renderInventoryManagement()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
