// Environment-specific constants
export const CONFIG = {
  OAUTH_HANDLER_URL: process.env.NEXT_PUBLIC_OAUTH_HANDLER_URL || 'https://wkhxqpckkkyajf3arhaqosfybq0ublyl.lambda-url.us-west-1.on.aws',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Currency formatting
export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

// Date formatting
export const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
