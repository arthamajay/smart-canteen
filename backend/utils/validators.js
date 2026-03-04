// Input validation helper functions

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (10 digits)
const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Validate positive number
const isPositiveNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

// Validate non-negative number
const isNonNegativeNumber = (value) => {
  return !isNaN(value) && parseFloat(value) >= 0;
};

// Validate order status
const isValidOrderStatus = (status) => {
  const validStatuses = ['CREATED', 'PAID', 'CONSUMED'];
  return validStatuses.includes(status);
};

// Validate payment status
const isValidPaymentStatus = (status) => {
  const validStatuses = ['PENDING', 'SUCCESS', 'FAILED'];
  return validStatuses.includes(status);
};

// Validate order status transition
const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'CREATED': ['PAID'],
    'PAID': ['CONSUMED'],
    'CONSUMED': [] // Terminal state - no transitions allowed
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Validate order items array
const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Order must contain at least one item' };
  }

  for (const item of items) {
    if (!item.item_id || !isPositiveNumber(item.item_id)) {
      return { valid: false, message: 'Invalid item_id' };
    }
    if (!item.quantity || !isPositiveNumber(item.quantity)) {
      return { valid: false, message: 'Invalid quantity' };
    }
  }

  return { valid: true };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidOrderStatus,
  isValidPaymentStatus,
  isValidStatusTransition,
  validateOrderItems,
};
