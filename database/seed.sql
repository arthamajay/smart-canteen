-- ============================================
-- Seed Data for Smart Canteen System
-- ============================================

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE order_items, payments, orders, items, users RESTART IDENTITY CASCADE;

-- ============================================
-- Insert Users
-- ============================================

INSERT INTO users (name, email, phone, role) VALUES
('Rahul Sharma', 'rahul.sharma@college.edu', '9876543210', 'student'),
('Priya Patel', 'priya.patel@college.edu', '9876543211', 'student'),
('Amit Kumar', 'amit.kumar@college.edu', '9876543212', 'student'),
('Sneha Reddy', 'sneha.reddy@college.edu', '9876543213', 'student'),
('Vendor Admin', 'vendor@canteen.com', '9876543214', 'vendor');

-- ============================================
-- Insert Items (Food Menu)
-- ============================================

-- Snacks
INSERT INTO items (name, description, price, stock_quantity, category, is_available) VALUES
('Samosa', 'Crispy fried pastry with spiced potato filling', 10.00, 100, 'Snacks', true),
('Vada Pav', 'Mumbai style potato fritter in a bun', 15.00, 80, 'Snacks', true),
('Bread Pakora', 'Deep fried bread with potato stuffing', 12.00, 60, 'Snacks', true),
('Spring Roll', 'Crispy vegetable spring rolls (2 pcs)', 20.00, 50, 'Snacks', true),
('Paneer Pakora', 'Fried cottage cheese fritters', 25.00, 40, 'Snacks', true);

-- Beverages
INSERT INTO items (name, description, price, stock_quantity, category, is_available) VALUES
('Tea', 'Hot masala tea', 10.00, 200, 'Beverages', true),
('Coffee', 'Hot filter coffee', 15.00, 150, 'Beverages', true),
('Cold Coffee', 'Chilled coffee with ice cream', 30.00, 80, 'Beverages', true),
('Lemon Soda', 'Fresh lemon soda', 20.00, 100, 'Beverages', true),
('Mango Juice', 'Fresh mango juice', 25.00, 60, 'Beverages', true);

-- Main Course
INSERT INTO items (name, description, price, stock_quantity, category, is_available) VALUES
('Veg Thali', 'Complete meal with rice, roti, dal, sabzi', 60.00, 50, 'Main Course', true),
('Paneer Butter Masala', 'Cottage cheese in rich tomato gravy with 2 rotis', 80.00, 40, 'Main Course', true),
('Chole Bhature', 'Spicy chickpeas with fried bread', 50.00, 45, 'Main Course', true),
('Dosa', 'Crispy rice crepe with sambar and chutney', 40.00, 60, 'Main Course', true),
('Idli Sambar', 'Steamed rice cakes with sambar (3 pcs)', 35.00, 70, 'Main Course', true);

-- Desserts
INSERT INTO items (name, description, price, stock_quantity, category, is_available) VALUES
('Gulab Jamun', 'Sweet milk solid balls in sugar syrup (2 pcs)', 20.00, 80, 'Desserts', true),
('Ice Cream', 'Vanilla ice cream cup', 25.00, 100, 'Desserts', true),
('Jalebi', 'Sweet crispy spirals (100g)', 30.00, 50, 'Desserts', true),
('Rasgulla', 'Soft cottage cheese balls in syrup (2 pcs)', 25.00, 60, 'Desserts', true);

-- ============================================
-- Insert Sample Orders (for testing)
-- ============================================

-- Order 1: Rahul's order (CONSUMED)
INSERT INTO orders (user_id, total_amount, status, qr_code_data, consumed_at) 
VALUES (1, 45.00, 'CONSUMED', '1', '2024-03-04 10:30:00');

INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal) VALUES
(1, 1, 2, 10.00, 20.00),  -- 2 Samosas
(1, 6, 1, 10.00, 10.00),  -- 1 Tea
(1, 4, 1, 15.00, 15.00);  -- 1 Spring Roll

INSERT INTO payments (order_id, payment_ref, amount, status, transaction_time) 
VALUES (1, 'PAY-1709567890-A3F9B2', 45.00, 'SUCCESS', '2024-03-04 10:25:00');

-- Order 2: Priya's order (PAID - ready for pickup)
INSERT INTO orders (user_id, total_amount, status, qr_code_data) 
VALUES (2, 95.00, 'PAID', '2');

INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal) VALUES
(2, 11, 1, 60.00, 60.00),  -- 1 Veg Thali
(2, 8, 1, 15.00, 15.00),   -- 1 Coffee
(2, 16, 1, 20.00, 20.00);  -- 1 Gulab Jamun

INSERT INTO payments (order_id, payment_ref, amount, status, transaction_time) 
VALUES (2, 'PAY-1709567891-B4G8C3', 95.00, 'SUCCESS', '2024-03-04 11:00:00');

-- Order 3: Amit's order (CREATED - not paid yet)
INSERT INTO orders (user_id, total_amount, status) 
VALUES (3, 70.00, 'CREATED');

INSERT INTO order_items (order_id, item_id, quantity, price_at_order, subtotal) VALUES
(3, 2, 2, 15.00, 30.00),   -- 2 Vada Pav
(3, 14, 1, 40.00, 40.00);  -- 1 Dosa

-- ============================================
-- Verification Queries
-- ============================================

-- Check inserted data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Items', COUNT(*) FROM items
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- Show all items by category
SELECT category, COUNT(*) as item_count, SUM(stock_quantity) as total_stock
FROM items
GROUP BY category
ORDER BY category;

-- Show order summary
SELECT 
    o.order_id,
    u.name as customer,
    o.total_amount,
    o.status,
    o.created_at,
    COUNT(oi.order_item_id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, u.name, o.total_amount, o.status, o.created_at
ORDER BY o.order_id;

COMMIT;
