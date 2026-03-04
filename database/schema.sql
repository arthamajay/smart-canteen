-- ============================================
-- Smart Canteen Database Schema
-- Database: PostgreSQL
-- ============================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- ============================================
-- ENUMS (Custom Types)
-- ============================================

-- User roles: student or vendor
CREATE TYPE user_role AS ENUM ('student', 'vendor');

-- Order status flow: CREATED → PAID → CONSUMED
CREATE TYPE order_status AS ENUM ('CREATED', 'PAID', 'CONSUMED');

-- Payment status: PENDING → SUCCESS → FAILED
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- ============================================
-- TABLE: users
-- Purpose: Store student and vendor information
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLE: items
-- Purpose: Store food items available in canteen
-- ============================================
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster category and availability searches
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_available ON items(is_available);

-- ============================================
-- TABLE: orders
-- Purpose: Store order information
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status NOT NULL DEFAULT 'CREATED',
    qr_code_data TEXT,  -- Store QR code data (order_id encoded)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consumed_at TIMESTAMP,  -- Track when order was consumed (for analytics)
    
    -- Constraints
    CONSTRAINT chk_consumed_time CHECK (
        (status = 'CONSUMED' AND consumed_at IS NOT NULL) OR 
        (status != 'CONSUMED' AND consumed_at IS NULL)
    )
);

-- Indexes for faster queries
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ============================================
-- TABLE: order_items
-- Purpose: Junction table linking orders and items
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10, 2) NOT NULL CHECK (price_at_order >= 0),  -- Store price at time of order
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate items in same order
    UNIQUE(order_id, item_id)
);

-- Indexes for faster joins
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_item ON order_items(item_id);

-- ============================================
-- TABLE: payments
-- Purpose: Store payment information and verification
-- ============================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_ref VARCHAR(100) UNIQUE NOT NULL,  -- Unique payment reference (simulated)
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT 'SIMULATED',  -- For future expansion
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- One payment per order
    UNIQUE(order_id)
);

-- Indexes for faster payment verification
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_ref ON payments(payment_ref);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to items table
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE users IS 'Stores student and vendor user information';
COMMENT ON TABLE items IS 'Stores food items available in the canteen';
COMMENT ON TABLE orders IS 'Stores order information with status tracking';
COMMENT ON TABLE order_items IS 'Junction table linking orders to items with quantities';
COMMENT ON TABLE payments IS 'Stores payment information with unique references';

COMMENT ON COLUMN orders.status IS 'Order lifecycle: CREATED → PAID → CONSUMED';
COMMENT ON COLUMN payments.payment_ref IS 'Unique payment reference - prevents duplicate usage';
COMMENT ON COLUMN order_items.price_at_order IS 'Price snapshot at order time - for historical accuracy';
