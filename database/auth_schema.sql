-- ============================================
-- Authentication & Role-Based Access Schema
-- Extension to existing Smart Canteen schema
-- ============================================

-- Add authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================
-- TABLE: sessions (for JWT alternative or session management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- TABLE: order_history (for student order tracking)
-- ============================================
-- This is a view, actual data is in orders table
CREATE OR REPLACE VIEW student_order_history AS
SELECT 
    o.order_id,
    o.user_id,
    u.name as student_name,
    u.email,
    o.total_amount,
    o.status,
    o.created_at,
    o.consumed_at,
    p.payment_ref,
    p.status as payment_status,
    COUNT(oi.order_item_id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN payments p ON o.order_id = p.order_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE u.role = 'student'
GROUP BY o.order_id, o.user_id, u.name, u.email, o.total_amount, 
         o.status, o.created_at, o.consumed_at, p.payment_ref, p.status
ORDER BY o.created_at DESC;

-- ============================================
-- TABLE: vendor_activity (track vendor scans)
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_activity (
    activity_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'SCAN', 'VERIFY', 'REJECT'
    result VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_activity_vendor ON vendor_activity(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_order ON vendor_activity(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_created ON vendor_activity(created_at);

-- ============================================
-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (name, email, phone, username, password_hash, role, is_active)
VALUES (
    'System Admin',
    'admin@canteen.com',
    '0000000000',
    'admin',
    '$2b$10$rKvVPZqGvXqVQXZ5xGxXxOxKvVPZqGvXqVQXZ5xGxXxOxKvVPZqGv', -- Placeholder, will be set by backend
    'admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE sessions IS 'User session management for authentication';
COMMENT ON TABLE vendor_activity IS 'Track all vendor scanning and verification activities';
COMMENT ON VIEW student_order_history IS 'Student-specific order history view';

COMMIT;
