// Global error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Duplicate entry: ' + (err.detail || 'Resource already exists');
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference: ' + (err.detail || 'Referenced resource does not exist');
        break;
      case '23502': // Not null violation
        statusCode = 400;
        message = 'Missing required field: ' + (err.column || 'Required field is missing');
        break;
      case '22P02': // Invalid text representation
        statusCode = 400;
        message = 'Invalid data format';
        break;
      case '23514': // Check constraint violation
        statusCode = 400;
        message = 'Data validation failed: ' + (err.detail || 'Invalid data');
        break;
      default:
        statusCode = 500;
        message = `Database error occurred (code: ${err.code})`;
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        code: err.code,
        detail: err.detail
      })
    }
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
