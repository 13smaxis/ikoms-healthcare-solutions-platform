# 2Checkout Quick Start Checklist

## Prerequisites
- [ ] 2Checkout merchant account (https://www.2checkout.com)
- [ ] Node.js 18+ installed
- [ ] Project cloned and dependencies installed: `npm install`

## Configuration (5 minutes)

### Get Credentials from 2Checkout
1. [ ] Log in to 2Checkout Dashboard
2. [ ] Navigate to: **Integrations** → **API**
3. [ ] Copy: **Merchant Code** (also called Merchant ID)
4. [ ] Copy: **API Key** (this is TWOCHECKOUT_SECRET_KEY)
5. [ ] Navigate to: **Integrations** → **Webhooks**
6. [ ] Copy: **Webhook Secret** (Buy link secret word)

### Update .env.local
1. [ ] Open `.env.local` in editor
2. [ ] Replace these values:
   ```env
   NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE=YOUR_MERCHANT_CODE
   TWOCHECKOUT_SECRET_KEY=YOUR_API_KEY
   TWOCHECKOUT_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
   ```
3. [ ] Save the file
4. [ ] Verify: `npm run validate:2checkout` (should pass all checks)

## Testing (10-15 minutes)

### Local Development Test
1. [ ] Start dev server: `npm run dev`
2. [ ] Open browser: http://localhost:3000/shop
3. [ ] Add product to cart
4. [ ] Click "Checkout"
5. [ ] Fill in address form
6. [ ] Click "Proceed to Payment"
7. [ ] Verify redirect to 2Checkout (or demo message if credentials missing)
8. [ ] Check Supabase: order should appear in `ecom_orders` with status 'pending'

### Complete a Test Payment (Sandbox)
1. [ ] In 2Checkout test/sandbox mode
2. [ ] Use test card: `4111111111111111`
3. [ ] Use any future expiry date
4. [ ] Use any 3-digit CVV
5. [ ] Complete payment
6. [ ] Check Supabase: order status should update to 'paid'
7. [ ] Verify order confirmation page displays correctly

## Production Deployment

### Before Going Live
1. [ ] Switch to production credentials (not sandbox)
2. [ ] Update `.env.local` with production merchant code/keys
3. [ ] Run: `npm run build` (verify no errors)
4. [ ] Run: `npm run start` (test production build)
5. [ ] Deploy to production environment

### Webhook Configuration (Production)
1. [ ] Log in to 2Checkout Dashboard
2. [ ] Go to: **Integrations** → **Webhooks**
3. [ ] Add webhook URL:
   - **URL**: `https://your-domain.com/api/checkout/webhooks/twocheckout`
   - **Events**: Select "Purchase Completed" and "Purchase Failed"
4. [ ] Save and verify webhook is active

### Post-Deployment Verification
1. [ ] Test checkout flow on production with test card
2. [ ] Verify orders appear in Supabase
3. [ ] Verify webhook notifications are received
4. [ ] Monitor 2Checkout dashboard for transactions
5. [ ] Check order confirmation email (if enabled)

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Demo mode" message | Run `npm run validate:2checkout` - merchant code not set |
| Order not created | Check browser DevTools Console for errors, verify Supabase connection |
| Redirect not working | Verify merchant code matches 2Checkout dashboard exactly |
| Webhook not updating | Check webhook logs in 2Checkout dashboard, verify URL is accessible |
| Payment not processing | Check 2Checkout sandbox/production mode setting matches credentials |

## Files to Reference

- **Setup Guide**: [2CHECKOUT_SETUP.md](2CHECKOUT_SETUP.md)
- **Full Summary**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Configuration**: [lib/twocheckout.ts](lib/twocheckout.ts)
- **Example Env**: [.env.local.example](.env.local.example)
- **Validation Script**: `npm run validate:2checkout`

## Commands Summary

```bash
# Validate setup
npm run validate:2checkout

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint
```

## Support Resources

- 2Checkout API Docs: https://docs.2checkout.com
- 2Checkout Sandbox: https://sandbox.2checkout.com
- Test Card: 4111111111111111 (Sandbox only)
- For ngrok tunneling (local webhook testing): https://ngrok.com

---

**Status**: Implementation Complete ✅  
**Next Action**: Obtain 2Checkout credentials and complete configuration steps above.
