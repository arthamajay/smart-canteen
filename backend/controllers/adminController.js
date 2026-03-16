const bcrypt = require('bcryptjs');
const db = require('../config/database');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [students, vendors, orders, revenue, todayOrders, todayRevenue, recentOrders] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role='student' AND is_active=TRUE"),
      db.query("SELECT COUNT(*) FROM users WHERE role='vendor' AND is_active=TRUE"),
      db.query("SELECT COUNT(*) FROM orders"),
      db.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status IN ('PAID','CONSUMED')"),
      db.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=CURRENT_DATE"),
      db.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE DATE(created_at)=CURRENT_DATE AND status IN ('PAID','CONSUMED')"),
      db.query(`SELECT o.order_id, u.name as student_name, o.total_amount, o.status, o.created_at
                FROM orders o JOIN users u ON o.user_id=u.user_id
                ORDER BY o.created_at DESC LIMIT 5`)
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(students.rows[0].count),
        totalVendors: parseInt(vendors.rows[0].count),
        totalOrders: parseInt(orders.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].total),
        todayOrders: parseInt(todayOrders.rows[0].count),
        todayRevenue: parseFloat(todayRevenue.rows[0].total),
        recentOrders: recentOrders.rows
      }
    });
  } catch (error) { next(error); }
};

// GET /api/admin/vendors
const getVendors = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT user_id, name, username, email, phone, is_active, created_at, last_login
       FROM users WHERE role='vendor' ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

// POST /api/admin/vendors
const createVendor = async (req, res, next) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: { message: 'All fields are required' } });
    }

    const existing = await db.query('SELECT user_id FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: { message: 'Username or email already exists' } });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, username, email, phone, password_hash, role, is_active)
       VALUES ($1,$2,$3,$4,$5,'vendor',TRUE)
       RETURNING user_id, name, username, email, phone, is_active, created_at`,
      [name, username, email, phone, password_hash]
    );

    res.status(201).json({ success: true, message: 'Vendor created successfully', data: result.rows[0] });
  } catch (error) { next(error); }
};

// PUT /api/admin/vendors/:id/toggle
const toggleVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE users SET is_active = NOT is_active WHERE user_id=$1 AND role='vendor'
       RETURNING user_id, name, is_active`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });
    res.json({ success: true, message: `Vendor ${result.rows[0].is_active ? 'activated' : 'deactivated'}`, data: result.rows[0] });
  } catch (error) { next(error); }
};

// GET /api/admin/students
const getStudents = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.user_id, u.name, u.username, u.email, u.phone, u.year, u.branch, u.is_active, u.created_at,
              COUNT(o.order_id) as total_orders
       FROM users u LEFT JOIN orders o ON u.user_id=o.user_id
       WHERE u.role='student' GROUP BY u.user_id ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

// GET /api/admin/items
const getItems = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT item_id, name, description, price, category, stock_quantity, is_available, created_at
       FROM items ORDER BY category, name`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

// POST /api/admin/items
const createItem = async (req, res, next) => {
  try {
    const { name, description, price, category, stock_quantity } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: { message: 'Name, price and category are required' } });
    }

    const result = await db.query(
      `INSERT INTO items (name, description, price, category, stock_quantity, is_available)
       VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING *`,
      [name, description || '', parseFloat(price), category, parseInt(stock_quantity) || 0]
    );
    res.status(201).json({ success: true, message: 'Item created', data: result.rows[0] });
  } catch (error) { next(error); }
};

// PUT /api/admin/items/:id
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity, is_available } = req.body;

    const result = await db.query(
      `UPDATE items SET name=$1, description=$2, price=$3, category=$4,
       stock_quantity=$5, is_available=$6, updated_at=CURRENT_TIMESTAMP
       WHERE item_id=$7 RETURNING *`,
      [name, description, parseFloat(price), category, parseInt(stock_quantity), is_available, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    res.json({ success: true, message: 'Item updated', data: result.rows[0] });
  } catch (error) { next(error); }
};

// DELETE /api/admin/items/:id
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE items SET is_available=FALSE WHERE item_id=$1', [id]);
    res.json({ success: true, message: 'Item deactivated' });
  } catch (error) { next(error); }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [dailySales, topItems, hourlyOrders, statusBreakdown] = await Promise.all([
      db.query(`SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_amount),0) as revenue
                FROM orders WHERE created_at >= NOW() - INTERVAL '7 days' AND status IN ('PAID','CONSUMED')
                GROUP BY DATE(created_at) ORDER BY date`),
      db.query(`SELECT i.name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
                FROM order_items oi JOIN items i ON oi.item_id=i.item_id
                JOIN orders o ON oi.order_id=o.order_id WHERE o.status IN ('PAID','CONSUMED')
                GROUP BY i.item_id, i.name ORDER BY total_sold DESC LIMIT 5`),
      db.query(`SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as orders
                FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY hour ORDER BY hour`),
      db.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`)
    ]);

    res.json({
      success: true,
      data: {
        dailySales: dailySales.rows,
        topItems: topItems.rows,
        hourlyOrders: hourlyOrders.rows,
        statusBreakdown: statusBreakdown.rows
      }
    });
  } catch (error) { next(error); }
};

module.exports = { getStats, getVendors, createVendor, toggleVendorStatus, getStudents, getItems, createItem, updateItem, deleteItem, getAnalytics };
