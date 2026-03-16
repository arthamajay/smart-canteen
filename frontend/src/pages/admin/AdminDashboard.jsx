import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaUserTie, FaBoxes, FaChartBar, FaSignOutAlt,
  FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaTimes,
  FaShoppingBag, FaRupeeSign, FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  getAdminStats, getAdminVendors, createVendor, toggleVendorStatus,
  getAdminStudents, getAdminItems, createAdminItem, updateAdminItem,
  deleteAdminItem, getAnalytics
} from '../../services/api';
import './AdminDashboard.css';

// ── Modal ──────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

// ── Overview Tab ───────────────────────────────────────────────────────────
const Overview = ({ stats, onTabChange }) => (
  <div className="tab-content">
    <h2 className="tab-title">Dashboard Overview</h2>
    <div className="stats-grid">
      {[
        { label: 'Total Students', value: stats.totalStudents, icon: <FaUsers />, color: 'blue' },
        { label: 'Total Vendors', value: stats.totalVendors, icon: <FaUserTie />, color: 'green' },
        { label: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingBag />, color: 'orange' },
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <FaRupeeSign />, color: 'purple' },
      ].map(s => (
        <div key={s.label} className={`stat-card ${s.color}`}>
          <div className="stat-icon">{s.icon}</div>
          <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value}</p></div>
        </div>
      ))}
    </div>

    <div className="today-row">
      <div className="today-card">
        <p className="today-label">Orders Today</p>
        <p className="today-value">{stats.todayOrders || 0}</p>
      </div>
      <div className="today-card">
        <p className="today-label">Revenue Today</p>
        <p className="today-value">₹{(stats.todayRevenue || 0).toLocaleString()}</p>
      </div>
    </div>

    {stats.recentOrders?.length > 0 && (
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Student</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {stats.recentOrders.map(o => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>{o.student_name}</td>
                <td>₹{parseFloat(o.total_amount).toFixed(2)}</td>
                <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="qa-row">
        <button className="qa-btn blue" onClick={() => onTabChange('vendors')}><FaPlus /> Add Vendor</button>
        <button className="qa-btn green" onClick={() => onTabChange('inventory')}><FaBoxes /> Manage Items</button>
        <button className="qa-btn purple" onClick={() => onTabChange('analytics')}><FaChartBar /> Analytics</button>
      </div>
    </div>
  </div>
);

// ── Vendors Tab ────────────────────────────────────────────────────────────
const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getAdminVendors();
      setVendors(res.data);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createVendor(form);
      toast.success('Vendor created successfully');
      setShowModal(false);
      setForm({ name: '', username: '', email: '', phone: '', password: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create vendor');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id, name, active) => {
    try {
      await toggleVendorStatus(id);
      toast.success(`${name} ${active ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update vendor status'); }
  };

  if (loading) return <div className="loading-msg">Loading vendors...</div>;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">Vendor Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}><FaPlus /> Add Vendor</button>
      </div>

      {vendors.length === 0 ? (
        <div className="empty-state">
          <FaUserTie className="empty-icon" />
          <p>No vendors yet. Add your first vendor!</p>
        </div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Last Login</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.user_id}>
                <td>{v.name}</td>
                <td><code>{v.username || '—'}</code></td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.last_login ? new Date(v.last_login).toLocaleDateString() : 'Never'}</td>
                <td><span className={`badge ${v.is_active ? 'badge-paid' : 'badge-consumed'}`}>{v.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button
                    className={`icon-btn ${v.is_active ? 'danger' : 'success'}`}
                    onClick={() => handleToggle(v.user_id, v.name, v.is_active)}
                    title={v.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {v.is_active ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title="Add New Vendor" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="modal-form">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Vendor name' },
              { label: 'Username', name: 'username', type: 'text', placeholder: 'Login username' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'Email address' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '10-digit phone' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Set password' },
            ].map(f => (
              <div key={f.name} className="form-group">
                <label>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  required
                />
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Vendor'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ── Inventory Tab ──────────────────────────────────────────────────────────
const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock_quantity: '', is_available: true });
  const [saving, setSaving] = useState(false);

  const categories = ['Snacks', 'Beverages', 'Meals', 'Main Course', 'Desserts', 'Breakfast', 'Other'];

  const load = useCallback(async () => {
    try {
      const res = await getAdminItems();
      setItems(res.data);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', description: '', price: '', category: '', stock_quantity: '', is_available: true });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, stock_quantity: item.stock_quantity, is_available: item.is_available });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateAdminItem(editItem.item_id, form);
        toast.success('Item updated');
      } else {
        await createAdminItem(form);
        toast.success('Item created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save item');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await deleteAdminItem(id);
      toast.success('Item deactivated');
      load();
    } catch { toast.error('Failed to deactivate item'); }
  };

  if (loading) return <div className="loading-msg">Loading items...</div>;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">Inventory Management</h2>
        <button className="btn-primary" onClick={openAdd}><FaPlus /> Add Item</button>
      </div>

      <table className="data-table">
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(item => (
            <tr key={item.item_id}>
              <td>
                <strong>{item.name}</strong>
                {item.description && <p className="item-desc">{item.description}</p>}
              </td>
              <td><span className="category-tag">{item.category}</span></td>
              <td>₹{parseFloat(item.price).toFixed(2)}</td>
              <td>
                <span className={`stock-badge ${item.stock_quantity <= 10 ? 'low' : 'ok'}`}>
                  {item.stock_quantity}
                </span>
              </td>
              <td><span className={`badge ${item.is_available ? 'badge-paid' : 'badge-consumed'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span></td>
              <td className="action-cell">
                <button className="icon-btn info" onClick={() => openEdit(item)} title="Edit"><FaEdit /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(item.item_id, item.name)} title="Deactivate"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal title={editItem ? 'Edit Item' : 'Add New Item'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label>Item Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} />
                Available for ordering
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Item'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ── Students Tab ───────────────────────────────────────────────────────────
const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminStudents()
      .then(res => setStudents(res.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-msg">Loading students...</div>;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">Students ({students.length})</h2>
        <input className="search-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Year / Branch</th><th>Orders</th><th>Joined</th></tr></thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.user_id}>
              <td>{s.name}</td>
              <td><code>{s.username || '—'}</code></td>
              <td>{s.email}</td>
              <td>{s.year} · {s.branch}</td>
              <td><span className="badge badge-paid">{s.total_orders}</span></td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-state"><p>No students found.</p></div>}
    </div>
  );
};

// ── Analytics Tab ──────────────────────────────────────────────────────────
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-msg">Loading analytics...</div>;
  if (!data) return null;

  return (
    <div className="tab-content">
      <h2 className="tab-title">Analytics & Reports</h2>

      <div className="analytics-grid">
        {/* Status Breakdown */}
        <div className="analytics-card">
          <h3>Order Status Breakdown</h3>
          <div className="status-breakdown">
            {data.statusBreakdown.map(s => (
              <div key={s.status} className="status-row">
                <span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span>
                <div className="status-bar-wrap">
                  <div className="status-bar" style={{ width: `${Math.min(100, (s.count / data.statusBreakdown.reduce((a, b) => a + parseInt(b.count), 0)) * 100)}%` }} />
                </div>
                <span className="status-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="analytics-card">
          <h3>Top Selling Items</h3>
          {data.topItems.length === 0 ? <p className="no-data">No sales data yet</p> : (
            <div className="top-items">
              {data.topItems.map((item, i) => (
                <div key={item.name} className="top-item-row">
                  <span className="rank">#{i + 1}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-sold">{item.total_sold} sold</span>
                  <span className="item-rev">₹{parseFloat(item.revenue).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Sales */}
        <div className="analytics-card wide">
          <h3>Last 7 Days Sales</h3>
          {data.dailySales.length === 0 ? <p className="no-data">No sales data yet</p> : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.dailySales.map(d => (
                  <tr key={d.date}>
                    <td>{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td>{d.orders}</td>
                    <td>₹{parseFloat(d.revenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Peak Hours */}
        <div className="analytics-card wide">
          <h3>Peak Order Hours</h3>
          {data.hourlyOrders.length === 0 ? <p className="no-data">No data yet</p> : (
            <div className="hourly-chart">
              {data.hourlyOrders.map(h => {
                const max = Math.max(...data.hourlyOrders.map(x => parseInt(x.orders)));
                const pct = (parseInt(h.orders) / max) * 100;
                const hr = parseInt(h.hour);
                const label = hr === 0 ? '12am' : hr < 12 ? `${hr}am` : hr === 12 ? '12pm' : `${hr - 12}pm`;
                return (
                  <div key={h.hour} className="hour-bar-wrap" title={`${h.orders} orders`}>
                    <div className="hour-bar" style={{ height: `${pct}%` }} />
                    <span className="hour-label">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});

  useEffect(() => {
    getAdminStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartBar /> },
    { id: 'vendors', label: 'Vendors', icon: <FaUserTie /> },
    { id: 'inventory', label: 'Inventory', icon: <FaBoxes /> },
    { id: 'students', label: 'Students', icon: <FaUsers /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-brand">
          <span className="brand-icon">🛡️</span>
          <div>
            <h1>Admin Portal</h1>
            <p>Welcome, {user.name}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
      </header>

      <div className="admin-layout">
        <nav className="admin-sidebar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <main className="admin-main">
          {activeTab === 'overview' && <Overview stats={stats} onTabChange={setActiveTab} />}
          {activeTab === 'vendors' && <Vendors />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'students' && <Students />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
