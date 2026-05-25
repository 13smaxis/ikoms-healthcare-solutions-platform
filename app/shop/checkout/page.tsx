"use client";

import React, { useEffect, useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { getCart, fmt, clearCart, CartItem } from '@/lib/cart';
import { Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

declare global { interface Window { Stripe?: any } }

const STRIPE_PK = 'pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ';
const STRIPE_ACCOUNT_ID = 'acct_1TPRzkHTDFR3zcgW';

const loadStripeJs = (): Promise<any> => new Promise((resolve, reject) => {
  if (window.Stripe) return resolve(window.Stripe);
  const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]') as HTMLScriptElement | null;
  const onReady = () => window.Stripe ? resolve(window.Stripe) : reject(new Error('Stripe failed to load'));
  if (existing) { existing.addEventListener('load', onReady); return; }
  const s = document.createElement('script');
  s.src = 'https://js.stripe.com/v3/';
  s.onload = onReady;
  s.onerror = () => reject(new Error('Stripe failed to load'));
  document.head.appendChild(s);
});

const Checkout: React.FC = () => {
  const nav = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addr, setAddr] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'United Kingdom' });
  const [tax, setTax] = useState(0);
  const [step, setStep] = useState<'address' | 'pay'>('address');
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [payError, setPayError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCart(getCart()); }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (step !== 'pay' || total <= 0 || clientSecret) return;
    (async () => {
      try {
        const S = await loadStripeJs();
        const stripeInstance = S(STRIPE_PK, { stripeAccount: STRIPE_ACCOUNT_ID });
        setStripe(stripeInstance);
        const { data, error } = await supabase.functions.invoke('create-payment-intent', { body: { amount: total, currency: 'gbp' } });
        if (error || !data?.clientSecret) { setPayError('Unable to initialise payment. Please try again.'); return; }
        setClientSecret(data.clientSecret);
        const els = stripeInstance.elements({ clientSecret: data.clientSecret });
        const paymentEl = els.create('payment');
        setTimeout(() => {
          const node = document.getElementById('stripe-payment-el');
          if (node) paymentEl.mount('#stripe-payment-el');
        }, 0);
        setElements(els);
      } catch (e: any) {
        setPayError(e.message || 'Payment setup failed');
      }
    })();
  }, [step, total, clientSecret]);

  const continueToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await supabase.functions.invoke('calculate-tax', { body: { subtotal } });
      setTax(data?.taxCents || 0);
    } catch {
      setTax(0);
    }
    setStep('pay');
  };

  const payNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setPayError('');
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) { setPayError(error.message || 'Payment failed'); setLoading(false); return; }
    if (paymentIntent?.status !== 'succeeded') { setPayError('Payment did not complete'); setLoading(false); return; }

    const { data: customer } = await supabase.from('ecom_customers').upsert({
      email: addr.email, name: addr.name, phone: addr.phone, address: addr,
    }, { onConflict: 'email' }).select('id').single();

    const { data: order } = await supabase.from('ecom_orders').insert({
      customer_id: customer?.id, status: 'paid', subtotal, tax, shipping, total,
      shipping_address: addr, stripe_payment_intent_id: paymentIntent.id,
    }).select('id').single();

    if (order) {
      const items = cart.map(i => ({
        order_id: order.id,
        product_id: i.product_id.startsWith('course-') ? null : i.product_id,
        variant_id: i.variant_id || null,
        product_name: i.name,
        variant_title: i.variant_title || null,
        sku: i.sku || null,
        quantity: i.quantity,
        unit_price: i.price,
        total: i.price * i.quantity,
      }));
      await supabase.from('ecom_order_items').insert(items);
    }

    fetch('https://famous.ai/api/crm/69ea64be485fe0443f9c974c/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr.email, name: addr.name, source: 'checkout', tags: ['customer'] }),
    }).catch(() => {});

    clearCart();
    nav.push(`/shop/order-confirmation?oid=${order?.id || ''}`);
  };

  if (cart.length === 0) {
    return <SiteLayout><div className="py-20 text-center text-slate-500">Your cart is empty.</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Checkout</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <span className={step === 'address' ? 'text-rose-700 font-semibold' : ''}>1. Shipping</span>
          <span>→</span>
          <span className={step === 'pay' ? 'text-rose-700 font-semibold' : ''}>2. Payment</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            {step === 'address' ? (
              <form onSubmit={continueToPay} className="space-y-4">
                <h2 className="font-bold text-slate-900">Shipping address</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input name="name" required placeholder="Full name" value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="email" required type="email" placeholder="Email" value={addr.email} onChange={e => setAddr({ ...addr, email: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="phone" placeholder="Phone" value={addr.phone} onChange={e => setAddr({ ...addr, phone: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="country" placeholder="Country" value={addr.country} onChange={e => setAddr({ ...addr, country: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="address" required placeholder="Address" value={addr.address} onChange={e => setAddr({ ...addr, address: e.target.value })} className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="city" required placeholder="City" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="state" placeholder="County / state" value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="zip" required placeholder="Postcode / ZIP" value={addr.zip} onChange={e => setAddr({ ...addr, zip: e.target.value })} className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <button type="submit" className="mt-3 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold">Continue to payment</button>
              </form>
            ) : (
              <form onSubmit={payNow}>
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Secure payment</h2>
                {payError && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm mb-3">{payError}</div>}
                <div id="stripe-payment-el" className="min-h-40 border border-slate-200 rounded-lg p-3 bg-white">
                  {!clientSecret && !payError && <div className="text-slate-500 text-sm">Loading secure payment form…</div>}
                </div>
                <button type="submit" disabled={!stripe || !clientSecret || loading} className="w-full mt-5 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> {loading ? 'Processing…' : `Pay ${fmt(total)}`}
                </button>
                <button type="button" onClick={() => setStep('address')} className="mt-3 text-sm text-slate-500 hover:text-slate-800">← Back to shipping</button>
              </form>
            )}
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">Order summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map((i, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    {i.image && <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{i.name}</div>
                      <div className="text-slate-500">Qty {i.quantity}</div>
                    </div>
                    <div className="font-semibold">{fmt(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="text-emerald-700">Free</span></div>
                <div className="flex justify-between"><span className="text-slate-600">VAT (20%)</span><span>{fmt(tax)}</span></div>
                <div className="flex justify-between pt-2 border-t font-bold text-base"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Checkout;