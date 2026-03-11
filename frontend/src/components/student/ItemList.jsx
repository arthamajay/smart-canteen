import React, { useState, useEffect } from 'react';
import { getAllItems } from '../../services/api';
import './ItemList.css';

const ItemList = ({ onAddToCart, cart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getAllItems();
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(items.map(item => item.category))];

  // Filter items by category
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  // Get quantity in cart for an item
  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item.item_id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="item-list">
      <h2 className="section-title">Menu</h2>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {filteredItems.map(item => {
          const cartQty = getCartQuantity(item.item_id);
          const isOutOfStock = item.stock_quantity === 0;

          return (
            <div key={item.item_id} className={`item-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
              <div className="item-header">
                <h3 className="item-name">{item.name}</h3>
                <span className="item-price">₹{parseFloat(item.price).toFixed(2)}</span>
              </div>

              {item.description && (
                <p className="item-description">{item.description}</p>
              )}

              <div className="item-footer">
                <span className="item-stock">
                  Stock: {item.stock_quantity}
                </span>

                {isOutOfStock ? (
                  <span className="out-of-stock-label">Out of Stock</span>
                ) : cartQty > 0 ? (
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => onAddToCart(item, -1)}
                    >
                      -
                    </button>
                    <span className="qty-display">{cartQty}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => onAddToCart(item, 1)}
                      disabled={cartQty >= item.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onAddToCart(item, 1)}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-items">No items found in this category</div>
      )}
    </div>
  );
};

export default ItemList;
