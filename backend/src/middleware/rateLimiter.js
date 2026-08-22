import rateLimit from 'express-rate-limit';

// Strict limiter on PIN verification (prevent brute force 6-digit guessing)
export const accessVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 verification attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many unlock attempts. Please wait 15 minutes before trying again. ♡',
  },
});

// General API limiter
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
});
