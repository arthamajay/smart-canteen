// Simple in-memory rate limiter for authentication endpoints.
// Prevents brute-force password attacks by limiting attempts per IP address.
//
// Note: This is in-memory, so it resets on server restart and doesn't share
// state across multiple server instances. For production with multiple
// instances, use express-rate-limit with a Redis store.

const loginAttempts = new Map(); // key: IP address, value: { count, resetTime }
const WINDOW_MS = 15 * 60 * 1000; // 15-minute window
const MAX_ATTEMPTS = 5; // max 5 attempts per 15-minute window

// Periodic cleanup of expired entries to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // cleanup every 5 minutes

const loginRateLimit = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();

  // Get or create the attempt record for this IP
  let record = loginAttempts.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + WINDOW_MS };
    loginAttempts.set(ip, record);
  }

  // Block if the limit has been reached
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
    return res.status(429).json({
      success: false,
      error: {
        message: `Too many login attempts. Please try again in ${retryAfterMinutes} minute(s).`
      }
    });
  }

  // Increment the counter
  record.count++;

  // Inform the client of remaining attempts
  res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_ATTEMPTS - record.count));

  next();
};

module.exports = { loginRateLimit };
