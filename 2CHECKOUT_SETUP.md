# 2Checkout Payment Integration Setup

## Overview

The IKOMS Healthcare platform uses **2Checkout** as the payment processor for the e-commerce checkout flow. This guide walks you through setup, credential configuration, and testing.

### Architecture Decision: Path 1 (ecom_* Tables)

This implementation preserves the existing **ecom schema** (ecom_customers, ecom_orders, ecom_order_items) instead of refactoring to a new schema. The Stripe integration was replaced with 2Checkout while keeping the checkout data model stable.

**Key components:**
- [app/shop/checkout/page.tsx](app/shop/checkout/page.tsx) — Creates order in ecom_orders, redirects to 2Checkout
- [app/api/checkout/process-payment/route.js](app/api/checkout/process-payment/route.js) — Builds secure purchase URL
- [app/api/checkout/webhooks/twocheckout/route.js](app/api/checkout/webhooks/twocheckout/route.js) — Receives payment notifications, updates order status
- [app/shop/order-confirmation/page.tsx](app/shop/order-confirmation/page.tsx) — Displays order summary after payment

## Step 1: Get 2Checkout Credentials

### For Production:

1. Log in to [2Checkout.com](https://www.2checkout.com)
2. Navigate to **Integrations** → **API**
3. Copy these values:
   - **Merchant Code** (merchant ID)
   - **API Key** (secret key for authentication)
   - **Webhook Secret** (for signature verification)
4. Note the **Return URL** (should be your domain + `/shop/order-confirmation`)

### For Development/Sandbox:

1. Log in to [2Checkout Sandbox](https://sandbox.2checkout.com)
2. Follow the same path to get sandbox credentials
3. Use sandbox URLs:
   - Checkout: `https://secure.sandbox.2checkout.com/checkout/purchase`
   - API: `https://sandbox-api.2checkout.com/rest/6.0`

## Step 2: Configure Environment Variables

Create or update `.env.local` in the project root:

```env
# 2Checkout - Production
NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE=your-merchant-code
TWOCHECKOUT_SECRET_KEY=your-secret-key
TWOCHECKOUT_WEBHOOK_SECRET=your-webhook-secret

# OR for Sandbox (development):
NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE=sandbox-merchant-code
TWOCHECKOUT_SECRET_KEY=sandbox-secret-key
TWOCHECKOUT_WEBHOOK_SECRET=sandbox-webhook-secret
```

**Note:** Do NOT commit `.env.local` to version control. Use `.env.local.example` as a template.

## Step 3: Verify Configuration

Check if 2Checkout is ready to use:

```bash
npm run dev
```

The app will automatically detect if credentials are configured via `is2CheckoutReady()` in [lib/twocheckout.ts](lib/twocheckout.ts).

If credentials are missing, the checkout will show a **demo mode message** instead of redirecting to 2Checkout.

## Step 4: Test the Checkout Flow

### Development Flow (with credentials):

1. Navigate to the shop: `http://localhost:3000/shop`
2. Add products to cart
3. Click **Checkout**
4. Fill in shipping address
5. Click **Proceed to Payment**
6. You should be **redirected to 2Checkout secure purchase page**

### Expected Flow:

```
User fills checkout → POST /api/checkout/process-payment
                  ↓
          Create order in ecom_orders (status: pending)
                  ↓
        Get order ID + amount
                  ↓
      Build 2Checkout secure URL
                  ↓
      Redirect to: https://secure.2checkout.com/checkout/purchase?merchant=XXX&order_id=XXX&...
                  ↓
        User completes payment
                  ↓
      2Checkout sends webhook to POST /api/checkout/webhooks/twocheckout
                  ↓
        Update ecom_orders.status = 'paid' or 'failed'
                  ↓
      User is redirected to order confirmation page
```

## Step 5: Configure Webhooks in 2Checkout Dashboard

For payment notifications to update your database:

1. Log in to 2Checkout Dashboard
2. Go to **Integrations** → **Webhooks**
3. Add webhook endpoint:
   - **URL**: `https://your-domain/api/checkout/webhooks/twocheckout`
   - **Events**: Select `Purchase Completed` and `Purchase Failed`
4. Copy the **Webhook Secret** and add to `.env.local` as `TWOCHECKOUT_WEBHOOK_SECRET`

**Note:** Your domain must be publicly accessible for webhooks to work. For local development, use a tunneling tool like `ngrok`:

```bash
ngrok http 3000
# Then register webhook with: https://your-ngrok-url.ngrok.io/api/checkout/webhooks/twocheckout
```

## Step 6: Test Sandbox Payment (Optional)

2Checkout provides sandbox test cards. Use these to test without real payments:

- **Card Number**: `4111111111111111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

These only work in sandbox mode. Production cards are required for live transactions.

## Testing Checklist

- [ ] Credentials configured in `.env.local`
- [ ] `NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE` is set
- [ ] Development server runs: `npm run dev`
- [ ] Cart page displays products correctly
- [ ] Checkout form validates and submits
- [ ] Redirects to 2Checkout (or shows demo mode if credentials missing)
- [ ] Order created in Supabase with status `pending`
- [ ] Webhook receives payment notification (check network logs in 2Checkout dashboard)
- [ ] Order status updates to `paid` after payment
- [ ] Order confirmation page displays with correct order details

## Troubleshooting

### "Demo mode" appears instead of 2Checkout redirect

**Cause**: Merchant code not configured or empty  
**Fix**: Check `.env.local` has `NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE` set

### Order not created in database

**Cause**: Supabase connection issue or invalid cart data  
**Fix**: Check network tab in DevTools → `/api/checkout/process-payment` response for errors

### Webhook signature verification fails

**Cause**: `TWOCHECKOUT_WEBHOOK_SECRET` mismatch  
**Fix**: Ensure the secret in `.env.local` matches 2Checkout dashboard exactly (case-sensitive)

### Payment status not updating

**Cause**: Webhook not reaching your app  
**Fix**:
- For local dev: Use ngrok and register with 2Checkout
- For production: Ensure CORS is not blocking the webhook
- Check `/api/checkout/webhooks/twocheckout` logs in server output

## Files Reference

| File | Purpose |
|------|---------|
| `lib/twocheckout.ts` | Configuration and readiness check |
| `app/shop/checkout/page.tsx` | Checkout form and order creation |
| `app/api/checkout/process-payment/route.js` | Generates 2Checkout secure URL |
| `app/api/checkout/webhooks/twocheckout/route.js` | Webhook handler for payment updates |
| `app/shop/order-confirmation/page.tsx` | Order confirmation display |
| `.env.local.example` | Template for environment variables |

## Next Steps

1. **Get credentials** from 2Checkout (sandbox or production)
2. **Update `.env.local`** with merchant code, secret key, and webhook secret
3. **Test the flow** using the checklist above
4. **Configure webhooks** in 2Checkout dashboard for production
5. **Deploy** when ready for production payments

## Support

For 2Checkout API documentation: [docs.2checkout.com](https://docs.2checkout.com)  
For webhook testing locally: [ngrok.com](https://ngrok.com)

---

**Schema Note**: This implementation uses the existing `ecom_*` tables (ecom_customers, ecom_orders, ecom_order_items). Do not refactor the schema unless specifically required — the current tables align with both checkout and admin panels.
