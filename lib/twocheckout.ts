/**
 * 2Checkout Configuration
 * 
 * This configuration handles both production and sandbox environments.
 * 
 * When credentials arrive:
 * 1. Get Merchant Code from 2Checkout Dashboard → Integrations → API
 * 2. Get Secret Key from same location
 * 3. Get Webhook Secret from 2Checkout Dashboard → Integrations → Webhooks
 * 4. Add to .env.local
 * 5. Run: npm run validate:2checkout (to verify setup)
 * 6. Run: npm run dev (to start development server)
 * 7. Deploy to production
 */

// Determine if using sandbox or production
const isSandbox = process.env.TWOCHECKOUT_SANDBOX_MODE === 'true';

export const TWOCHECKOUT_CONFIG = {
  merchantCode: process.env.NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE || '',
  secretKey: process.env.TWOCHECKOUT_SECRET_KEY || '',
  webhookSecret: process.env.TWOCHECKOUT_WEBHOOK_SECRET || '',
  
  // 2Checkout endpoints - Production
  hostingUrl: 'https://secure.2checkout.com/checkout/purchase',
  apiUrl: 'https://api.2checkout.com/rest/6.0',
  
  // 2Checkout endpoints - Sandbox
  sandboxHostingUrl: 'https://secure.sandbox.2checkout.com/checkout/purchase',
  sandboxApiUrl: 'https://sandbox-api.2checkout.com/rest/6.0',
  
  // Current mode
  isSandbox,
  
  // Helper to get the active hosting URL based on mode
  getHostingUrl() {
    return this.isSandbox ? this.sandboxHostingUrl : this.hostingUrl;
  },
  
  // Helper to get the active API URL based on mode
  getApiUrl() {
    return this.isSandbox ? this.sandboxApiUrl : this.apiUrl;
  },
};

/**
 * Check if 2Checkout is properly configured and ready to use
 */
export const is2CheckoutReady = () => {
  return !!(
    TWOCHECKOUT_CONFIG.merchantCode &&
    TWOCHECKOUT_CONFIG.secretKey &&
    TWOCHECKOUT_CONFIG.webhookSecret
  );
};

/**
 * Get configuration status for logging/debugging
 */
export const get2CheckoutStatus = () => {
  const ready = is2CheckoutReady();
  const mode = TWOCHECKOUT_CONFIG.isSandbox ? 'SANDBOX' : 'PRODUCTION';
  
  if (!ready) {
    return {
      status: 'NOT_CONFIGURED',
      mode,
      message: '2Checkout is not configured. Add credentials to .env.local',
    };
  }
  
  return {
    status: 'READY',
    mode,
    merchantCode: TWOCHECKOUT_CONFIG.merchantCode.substring(0, 5) + '***',
    hostingUrl: TWOCHECKOUT_CONFIG.getHostingUrl(),
  };
};
