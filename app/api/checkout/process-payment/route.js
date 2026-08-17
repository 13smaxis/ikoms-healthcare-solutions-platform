import { createClient } from '@supabase/supabase-js';
import { validatePaymentInput } from '@/lib/validation';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Server-side only!
);

// 2Checkout configuration (from environment variables)
const TWOCHECKOUT_CONFIG = {
  merchantCode: process.env.NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE || '',
  secretKey: process.env.TWOCHECKOUT_SECRET_KEY || '',
  hostingUrl: 'https://secure.2checkout.com/checkout/purchase',
  sandboxUrl: 'https://secure.sandbox.2checkout.com/checkout/purchase',
};

function is2CheckoutReady() {
  return !!(TWOCHECKOUT_CONFIG.merchantCode && TWOCHECKOUT_CONFIG.secretKey);
}

/**
 * POST /api/checkout/process-payment
 * 
 * Initiates 2Checkout payment
 * 
 * Flow:
 * 1. Validate orderId input
 * 2. Fetch order from DB
 * 3. Verify order status is 'pending'
 * 4. Generate 2Checkout checkout URL with signature
 * 5. Update order status to 'awaiting_payment'
 * 6. Return checkoutUrl for client redirect
 * 
 * Security:
 * ✓ Validates input
 * ✓ Verifies order exists and is in correct state
 * ✓ Only server has access to secret key
 * ✓ Signs request to prevent tampering
 */

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. VALIDATE INPUT
    const validation = validatePaymentInput(body);
    if (!validation.success) {
      console.error('Payment validation failed:', validation.error.flatten());
      return Response.json(
        { error: 'Invalid payment request' },
        { status: 400 }
      );
    }

    const { orderId } = validation.data;

    console.log(`[PAYMENT] Initiating payment for order: ${orderId}`);

    // 2. CHECK IF 2CHECKOUT IS CONFIGURED
    if (!is2CheckoutReady()) {
      console.warn('[PAYMENT] 2Checkout not configured - awaiting credentials');
      return Response.json(
        {
          error: 'Payment processor not ready',
          message: 'Awaiting 2Checkout configuration',
        },
        { status: 503 }
      );
    }

    // 3. FETCH ORDER
    const { data: order, error: orderError } = await supabase
      .from('ecom_orders')
      .select('id, status, total, currency, customer_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[PAYMENT] Order not found:', orderId);
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 4. VERIFY ORDER STATUS
    if (order.status !== 'pending') {
      console.warn(`[PAYMENT] Order ${orderId} is not pending, current status: ${order.status}`);
      return Response.json(
        {
          error: 'Order cannot be paid',
          message: `Order status is ${order.status}`,
        },
        { status: 400 }
      );
    }

    // 5. BUILD 2CHECKOUT CHECKOUT URL
    const params = {
      merchant: TWOCHECKOUT_CONFIG.merchantCode,
      order_number: orderId,
      amount: order.total.toFixed(2),
      currency: order.currency || 'EUR',
      return_url: `${
        process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'
      }/shop/order-confirmation?oid=${orderId}`,
    };

    // Generate HMAC-SHA256 signature
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    const signature = crypto
      .createHmac('sha256', TWOCHECKOUT_CONFIG.secretKey)
      .update(paramString)
      .digest('hex');

    // Build final checkout URL
    const checkoutUrl = new URL(TWOCHECKOUT_CONFIG.hostingUrl);
    Object.entries(params).forEach(([k, v]) => {
      checkoutUrl.searchParams.append(k, String(v));
    });
    checkoutUrl.searchParams.append('signature', signature);

    console.log(`[PAYMENT] Checkout URL generated for order: ${orderId}`);

    // 6. UPDATE ORDER STATUS TO 'AWAITING_PAYMENT'
    const { error: updateError } = await supabase
      .from('ecom_orders')
      .update({ status: 'awaiting_payment' })
      .eq('id', orderId);

    if (updateError) {
      console.error('[PAYMENT] Failed to update order status:', updateError);
      // Don't fail the request - still return checkout URL
      // Payment can still proceed
    }

    console.log(`[PAYMENT] Order ${orderId} status updated to awaiting_payment`);

    // 7. RETURN CHECKOUT URL
    return Response.json(
      {
        success: true,
        checkoutUrl: checkoutUrl.toString(),
        orderId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[PAYMENT] Unexpected error:', error);
    return Response.json(
      {
        error: 'Payment initiation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(req) {
  return Response.json({
    status: 'ok',
    endpoint: 'POST /api/checkout/process-payment',
    configured: is2CheckoutReady(),
  });
}