import rateLimit from "express-rate-limit";

/**
 * Global API rate limiter — 100 requests per 15 minutes per IP.
 * Applies to all routes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: "Too many requests. Please try again in a few minutes.",
  },
});

/**
 * Generation-specific rate limiter — 10 requests per 15 minutes per IP.
 * Stricter limit to protect AI token budget.
 */
export const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Generation rate limit exceeded. You can generate up to 10 pieces of content every 15 minutes.",
  },
});
