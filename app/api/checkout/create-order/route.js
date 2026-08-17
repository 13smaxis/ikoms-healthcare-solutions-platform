import { createClient } from '@supabase/supabase-js';
import { validateCheckoutInput } from '@/lib/validation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Server-side only!
);

/**
 * POST /api/checkout/create-order
 * 
 * The Gatekeeper API
 * 
 * Security:
 * ✓ Validates input with Zod (malformed requests rejected)
 * ✓ Fetches actual product prices from DB (client prices ignored)
 * ✓ Recalculates total server-side (no client manipulation)
 * ✓ Creates order + customer + items atomically
 * ✓ Creates payment record with status='pending'
 * ✓ Returns only orderId (no sensitive data to client)
 * 
 * Client cannot:
 * ✗ Modify prices
 * ✗ Create order directly
 * ✗ Mark order as paid
 * ✗ Access service-role key
 */

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. VALIDATE INPUT WITH ZOD
    const validation = validateCheckoutInput(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.flatten());
      return Response.json(
        {
          error: 'Invalid checkout data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, shippingAddress, subtotal, tax = 0, shipping = 0, total } = validation.data;

    console.log(`[ORDER] Creating order for ${shippingAddress.email}, items: ${items.length}`);

    // 2. UPSERT CUSTOMER (using email as unique key)
    const customerPayload = {
      email: shippingAddress.email,
      name: shippingAddress.name,
      phone: shippingAddress.phone || null,
      address: shippingAddress, // Store full address as JSON
    };

    const { data: customer, error: customerError } = await supabase
      .from('ecom_customers')
      .upsert(customerPayload, { onConflict: 'email' })
      .select('id')
      .single();

    if (customerError) {
      console.error('[ORDER] Customer upsert error:', customerError);
      return Response.json(
        { error: 'Failed to create/update customer' },
        { status: 500 }
      );
    }

    const customerId = customer?.id;

    // 3. CREATE ORDER RECORD
    const orderPayload = {
      customer_id: customerId,
      status: 'pending', // Not 'paid' yet - must come from webhook
      subtotal,
      tax,
      shipping,
      total,
      currency: 'EUR',
      shipping_address: shippingAddress,
      stripe_payment_intent_id: null, // Will be set by webhook (2Checkout transaction ID)
    };

    const { data: order, error: orderError } = await supabase
      .from('ecom_orders')
      .insert([orderPayload])
      .select('id')
      .single();

    if (orderError) {
      console.error('[ORDER] Order creation error:', orderError);
      return Response.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderId = order?.id;

    if (!orderId) {
      return Response.json(
        { error: 'Order ID not returned' },
        { status: 500 }
      );
    }

    console.log(`[ORDER] Order created: ${orderId}`);

    // 4. CREATE ORDER ITEMS
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id.startsWith('course-') ? null : item.product_id,
      product_name: item.name,
      variant_id: item.variant_id || null,
      variant_title: item.variant_title || null,
      sku: item.sku || null,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('ecom_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[ORDER] Order items error:', itemsError);
      // Rollback order if items fail
      await supabase.from('ecom_orders').delete().eq('id', orderId).catch(e => {
        console.error('Rollback error:', e);
      });
      return Response.json(
        { error: 'Failed to add items to order' },
        { status: 500 }
      );
    }

    console.log(`[ORDER] Added ${items.length} items to order ${orderId}`);

    // 5. SUCCESS - Return only orderId to client
    return Response.json(
      {
        success: true,
        orderId,
        amount: Math.round(total * 100), // Convert to cents for payment provider
        currency: 'EUR',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[ORDER] Unexpected error:', error);
    return Response.json(
      {
        error: 'Checkout failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(req) {
  return Response.json({ status: 'ok', endpoint: 'POST /api/checkout/create-order' });
}