-- ============================================
-- Inventory Table Schema
-- Phase 4: Stock Management
-- ============================================

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL UNIQUE REFERENCES items(item_id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    low_stock_threshold INTEGER DEFAULT 10,
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure reserved doesn't exceed stock
    CONSTRAINT chk_reserved_stock CHECK (reserved_quantity <= stock_quantity)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(stock_quantity) 
    WHERE stock_quantity <= low_stock_threshold;

-- Insert initial inventory for existing items
INSERT INTO inventory (item_id, stock_quantity, low_stock_threshold)
SELECT 
    item_id,
    100 as stock_quantity,  -- Default stock
    10 as low_stock_threshold
FROM items
ON CONFLICT (item_id) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_inventory_timestamp ON inventory;
CREATE TRIGGER trigger_update_inventory_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- Comments
COMMENT ON TABLE inventory IS 'Tracks stock levels and reservations for items';
COMMENT ON COLUMN inventory.stock_quantity IS 'Total physical stock available';
COMMENT ON COLUMN inventory.reserved_quantity IS 'Stock reserved for pending orders';
COMMENT ON COLUMN inventory.available_quantity IS 'Computed: stock_quantity - reserved_quantity';

COMMIT;
