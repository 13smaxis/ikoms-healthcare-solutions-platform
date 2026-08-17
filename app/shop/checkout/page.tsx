
"use client";

import React, { useEffect, useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { getCart, fmt, clearCart, CartItem } from '@/lib/cart';
import { subscribeEmail } from '@/lib/crm';
import { Lock, ShieldCheck } from 'lucide-react';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addr, setAddr] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'United Kingdom' });
  const [tax, setTax] = useState(0);
  const [step, setStep] = useState<'address' | 'pay'>('address');
  const [payError, setPayError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCart(getCart()); }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping + tax;

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
    setLoading(true);
    setPayError('');

    try {
      const customerPayload = {
        email: addr.email,
        name: addr.name,
        phone: addr.phone || null,
      };

      const { data: customer } = await (supabase.from('customers' as any).upsert(
        customerPayload as any,
        { onConflict: 'email' } as any,
      ).select('customerid').single() as any);

      const customerId = (customer as any)?.customerid;
      if (!customerId) {
        throw new Error('Failed to create customer record');
      }

      const { data: order } = await (supabase.from('orders' as any).insert({
        storeid: process.env.NEXT_PUBLIC_STORE_ID,
        customerid: customerId,
        status: 'pending',
        totalamount: total,
        shippingaddress_street: addr.address,
        shippingaddress_city: addr.city,
        shippingaddress_province: addr.state,
        shippingaddress_postalcode: addr.zip,
        shippingaddress_country: addr.country,
      } as any).select('orderid').single() as any);

      const orderId = (order as any)?.orderid;
      if (!orderId) 
      {
        throw new Error('Unable to create your order. Please try again.');
      }

      const items = cart
        .filter(i => !i.product_id.startsWith('course-'))
        .map((i) => ({
          orderid: orderId,
          productid: i.product_id,
          quantity: i.quantity,
          unitprice: i.price,
        }));

      if (items.length > 0) 
      {
        await supabase.from('order_items' as any).insert(items as any);
      }

      await supabase.from('payments' as any).insert({
        orderid: orderId,
        paymentmethod: '2checkout',
        amount: total,
        status: 'pending',
      } as any);

      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          amount: Math.round(total * 100),
          currency: 'GBP',
          returnUrl: `${window.location.origin}/shop/order-confirmation?oid=${orderId}`,
        }),
      });

      const paymentData = await response.json();

      if (!response.ok || !paymentData?.checkoutUrl) 
      {
        throw new Error(paymentData?.message || 'Failed to initialise 2Checkout payment.');
      }

      try { await subscribeEmail({ email: addr.email, name: addr.name, source: 'checkout', tags: ['customer'] }); } catch { }

      clearCart();
      window.location.href = paymentData.checkoutUrl;
    } catch (error: any) {
      setPayError(error.message || 'Payment failed');
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
                  <input name="name" required 
                         placeholder="Full name" 
                         value={addr.name} 
                         onChange={e => setAddr({ ...addr, name: e.target.value })} 
                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input name="email" 
                         required type="email" 
                         placeholder="Email" 
                         value={addr.email} 
                         onChange={e => setAddr({ ...addr, email: e.target.value })} 
                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input name="phone" 
                         placeholder="Phone" value={addr.phone} 
                         onChange={e => setAddr({ ...addr, phone: e.target.value })} 
                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input name="country" 
                         placeholder="Country" 
                         value={addr.country} 
                         onChange={e => setAddr({ ...addr, country: e.target.value })} 
                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  />
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
                <div className="min-h-40 border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-sm text-slate-600 mb-2">Pay with 2Checkout</div>
                  <div className="text-2xl font-bold text-slate-900">{fmt(total)}</div>
                  <p className="mt-3 text-sm text-slate-500">You will be redirected to the secure 2Checkout payment page to complete your purchase.</p>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-5 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> {loading ? 'Preparing payment…' : `Pay ${fmt(total)}`}
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