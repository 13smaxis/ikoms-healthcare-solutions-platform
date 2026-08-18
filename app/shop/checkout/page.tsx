"use client";

import React, { useEffect, useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { getCart, fmt, clearCart, CartItem } from '@/lib/cart';
import { subscribeEmail } from '@/lib/crm';
import { Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

/**
 * Checkout Page (Updated)
 * 
 * SECURITY:
 * ✓ No direct Supabase access from frontend
 * ✓ Calls /api/checkout/create-order to create order (server validates everything)
 * ✓ Calls /api/checkout/process-payment to initiate 2Checkout
 * ✓ Frontend can't modify prices or order status
 * ✓ Payment confirmed by webhook only
 * 
 * Flow:
 * 1. Customer fills shipping form
 * 2. Click "Continue to payment"
 * 3. Customer clicks "Pay"
 * 4. Call /api/checkout/create-order → Server validates + creates order
 * 5. Call /api/checkout/process-payment → Server generates 2Checkout URL
 * 6. Redirect to 2Checkout (user pays)
 * 7. 2Checkout sends webhook to /api/webhooks/twocheckout
 * 8. Webhook marks order as paid
 * 9. 2Checkout redirects back to order-confirmation page
 * 10. Order confirmation page loads order (now marked as paid)
 */

const Checkout: React.FC = () => {
  const nav = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addr, setAddr] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United Kingdom',
  });                                                                                                                             //- Creates a new shipping object
  const [tax, setTax] = useState(0);
  const [step, setStep] = useState<'address' | 'pay'>('address');
  const [payError, setPayError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping + tax;

  const continueToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Calculate tax via Supabase function if available
      setTax(0);
    } catch {
      setTax(0);
    }
    setStep('pay');
  };

  const payNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPayError('');

    try {
      console.log('[CHECKOUT] Starting payment flow');

      // STEP 1: Create order via API
      // This is the gatekeeper - server validates everything
      console.log('[CHECKOUT] Calling /api/checkout/create-order');

      const createOrderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            name: addr.name,
            email: addr.email,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            country: addr.country,
          },
          subtotal,
          tax,
          shipping,
          total,
        }),
      });

      if (!createOrderResponse.ok) {
        const error = await createOrderResponse.json();
        console.error('[CHECKOUT] Order creation failed:', error);
        setPayError(error.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const orderData = await createOrderResponse.json();
      const orderId = orderData.orderId;

      console.log(`[CHECKOUT] ✓ Order created: ${orderId}`);

      // STEP 2: Initiate payment via API
      // Server generates 2Checkout URL with signature
      console.log('[CHECKOUT] Calling /api/checkout/process-payment');

      const paymentResponse = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        console.error('[CHECKOUT] Payment initiation failed:', error);
        setPayError(error.error || 'Payment setup failed');
        setLoading(false);
        return;
      }

      const paymentData = await paymentResponse.json();

      console.log(`[CHECKOUT] ✓ Payment initiated`);

      // STEP 3: Redirect to 2Checkout
      if (paymentData.checkoutUrl) {
        console.log('[CHECKOUT] Redirecting to 2Checkout...');
        window.location.href = paymentData.checkoutUrl;
        return;
      }

      setPayError('No checkout URL received from server');
      setLoading(false);

    } catch (error: any) {
      console.error('[CHECKOUT] Error:', error);
      setPayError(error.message || 'Checkout failed');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SiteLayout>
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Checkout' }]} />
          </div>
        </section>
        <div className="py-20 text-center text-slate-500">Your cart is empty.</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Checkout' }]} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Checkout</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <span className={step === 'address' ? 'text-rose-700 font-semibold' : ''}>
            1. Shipping
          </span>
          <span>→</span>
          <span className={step === 'pay' ? 'text-rose-700 font-semibold' : ''}>
            2. Payment
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            {step === 'address' ? (
              <form onSubmit={continueToPay} className="space-y-4">
                <h2 className="font-bold text-slate-900">Shipping address</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    name="name"
                    required
                    placeholder="Full name"
                    value={addr.name}
                    onChange={e => setAddr({ ...addr, name: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="Email"
                    value={addr.email}
                    onChange={e => setAddr({ ...addr, email: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={addr.phone}
                    onChange={e => setAddr({ ...addr, phone: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="country"
                    placeholder="Country"
                    value={addr.country}
                    onChange={e => setAddr({ ...addr, country: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="address"
                    required
                    placeholder="Address"
                    value={addr.address}
                    onChange={e => setAddr({ ...addr, address: e.target.value })}
                    className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="city"
                    required
                    placeholder="City"
                    value={addr.city}
                    onChange={e => setAddr({ ...addr, city: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="state"
                    placeholder="County / state"
                    value={addr.state}
                    onChange={e => setAddr({ ...addr, state: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    name="zip"
                    required
                    placeholder="Postcode / ZIP"
                    value={addr.zip}
                    onChange={e => setAddr({ ...addr, zip: e.target.value })}
                    className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold"
                >
                  Continue to payment
                </button>
              </form>
            ) : (
              <form onSubmit={payNow}>
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Secure payment
                </h2>
                {payError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm mb-3">
                    {payError}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-sm mb-4">
                  💳 You'll be redirected to our secure 2Checkout payment page to complete your purchase.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />{' '}
                  {loading ? 'Processing…' : `Pay ${fmt(total)}`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="mt-3 text-sm text-slate-500 hover:text-slate-800"
                >
                  ← Back to shipping
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">Order summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map((i, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    {i.image && (
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{i.name}</div>
                      <div className="text-slate-500">Qty {i.quantity}</div>
                    </div>
                    <div className="font-semibold">{fmt(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-emerald-700">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">VAT (20%)</span>
                  <span>{fmt(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-base">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Checkout;