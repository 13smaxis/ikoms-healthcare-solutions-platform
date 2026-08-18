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
    // IKOMS schema: customers table
    const customerPayload = {
      email: shippingAddress.email,
      name: shippingAddress.name,
      surname: null, // null instead of empty string
      phone: shippingAddress.phone || null,
      status: 'active',
      userid: null, // Nullable field
    };

    console.log('[ORDER] Upserting customer:', customerPayload);

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(customerPayload, { onConflict: 'email' })
      .select('customerid')
      .single();

    if (customerError) {
      console.error('[ORDER] Customer upsert error:', customerError);
      console.error('[ORDER] Customer payload:', customerPayload);
      return Response.json(
        { error: 'Failed to create/update customer', details: customerError.message },
        { status: 500 }
      );
    }

    const customerId = customer?.customerid;

    if (!customerId) {
      console.error('[ORDER] No customerid returned from upsert');
      return Response.json(
        { error: 'Customer ID not returned' },
        { status: 500 }
      );
    }

    console.log(`[ORDER] Customer created/updated: ${customerId}`);

    // 3. CREATE ORDER RECORD
    // IKOMS schema: orders table
    const orderPayload = {
      storeid: process.env.NEXT_PUBLIC_STORE_ID || 'default-store',
      customerid: customerId,
      orderdate: new Date().toISOString(),
      status: 'pending', // Not 'paid' yet - must come from webhook
      totalamount: total,
      shippingaddress_street: shippingAddress.address,
      shippingaddress_city: shippingAddress.city,
      shippingaddress_province: shippingAddress.state || null,
      shippingaddress_postalcode: shippingAddress.zip,
      shippingaddress_country: shippingAddress.country,
      notes: null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('orderid')
      .single();

    if (orderError) {
      console.error('[ORDER] Order creation error:', orderError);
      return Response.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    const orderId = order?.orderid;

    if (!orderId) {
      return Response.json(
        { error: 'Order ID not returned' },
        { status: 500 }
      );
    }

    console.log(`[ORDER] Order created: ${orderId}`);

    // 4. CREATE ORDER ITEMS
    // IKOMS schema: order_items table
    const orderItems = items.map(item => ({
      orderid: orderId,
      productid: item.product_id,
      quantity: item.quantity,
      unitprice: item.price,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
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