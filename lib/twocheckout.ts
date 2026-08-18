
/**
 * 2Checkout Configuration
 * 
 * IMPORTANT: When 2Checkout credentials arrive:
 * 1. Get Merchant Code from 2Checkout Dashboard → Integrations → Webhooks & API
 * 2. Get Secret Key from same location
 * 3. Get Webhook Secret (Buy link secret word)
 * 4. Add to .env.local:
 *    NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE=your_code
 *    TWOCHECKOUT_SECRET_KEY=your_secret_key
 *    TWOCHECKOUT_WEBHOOK_SECRET=your_webhook_secret
 * 5. Deploy to Vercel
 */

export const TWOCHECKOUT_CONFIG = {
  // Public credentials (can be in NEXT_PUBLIC_*)
  merchantCode: process.env.NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE || '',
  
  // Secret credentials (server-side only)
  secretKey: process.env.TWOCHECKOUT_SECRET_KEY || '',
  webhookSecret: process.env.TWOCHECKOUT_WEBHOOK_SECRET || '',
  
  // API endpoints
  hostingUrl: 'https://secure.2checkout.com/checkout/purchase',
  sandboxHostingUrl: 'https://secure.sandbox.2checkout.com/checkout/purchase',
  apiUrl: 'https://api.2checkout.com/rest/6.0',
  sandboxApiUrl: 'https://sandbox-api.2checkout.com/rest/6.0',
};

/**
 * Check if 2Checkout is ready to process payments
 * Returns true only if all required credentials are present
 */
export function is2CheckoutReady() {
  return !!(
    TWOCHECKOUT_CONFIG.merchantCode &&
    TWOCHECKOUT_CONFIG.secretKey &&
    TWOCHECKOUT_CONFIG.webhookSecret
  );
}

/**
 * Get the appropriate environment (production or sandbox)
 */
export function get2CheckoutEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'production' : 'sandbox';
}

/**
 * Get the appropriate URL based on environment
 */
export function get2CheckoutUrl() {
  const env = get2CheckoutEnvironment();
  return env === 'production'
    ? TWOCHECKOUT_CONFIG.hostingUrl
    : TWOCHECKOUT_CONFIG.sandboxHostingUrl;
}