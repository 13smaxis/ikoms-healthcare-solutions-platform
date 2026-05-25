"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { Trash2, ShoppingCart, ArrowRight, Truck } from 'lucide-react';
import { getCart, updateQty, removeFromCart, cartSubtotal, fmt, CartItem } from '@/lib/cart';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const refresh = () => setCart(getCart());
  useEffect(() => {
    refresh();
    window.addEventListener('cartUpdated', refresh);
    return () => window.removeEventListener('cartUpdated', refresh);
  }, []);

  const subtotal = cartSubtotal();

  if (cart.length === 0) {
    return (
      <SiteLayout>
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Cart' }]} />
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center">
          <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-sm sm:text-base text-slate-600 mb-8">Browse our shop to add products, or book a course or consultation.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/shop/products" className="px-5 sm:px-6 py-3 bg-rose-700 text-white rounded-lg font-semibold text-sm sm:text-base">Shop products</Link>
            <Link href="/training/courses" className="px-5 sm:px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm sm:text-base">Browse courses</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Cart' }]} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">                                            {/* Page header */ }
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Your cart</h1>
        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">{cart.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
        <div className="grid lg:grid-cols-3 gap-5 sm:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-44 sm:w-24 sm:h-24 object-cover rounded-lg" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{item.name}</div>
                  {item.variant_title && <div className="text-sm text-slate-500">{item.variant_title}</div>}
                  {item.sku && <div className="text-xs text-slate-400">SKU: {item.sku}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1, item.variant_id)} className="px-2.5 py-1 text-slate-700">−</button>
                      <div className="w-8 text-center text-sm font-semibold">{item.quantity}</div>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1, item.variant_id)} className="px-2.5 py-1 text-slate-700">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-slate-500 hover:text-red-600 inline-flex items-center gap-1 text-sm"><Trash2 className="w-4 h-4" /> Remove</button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-bold text-slate-900 text-sm sm:text-base">{fmt(item.price * item.quantity)}</div>
                  <div className="text-xs text-slate-500">{fmt(item.price)} each</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-bold text-slate-900 mb-4">Order summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="font-semibold text-emerald-700">Free</span></div>
                <div className="flex justify-between"><span className="text-slate-600">VAT (calculated at checkout)</span><span className="text-slate-500">—</span></div>
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">
                <span className="font-bold">Total (ex. VAT)</span>
                <span className="font-bold text-lg">{fmt(subtotal)}</span>
              </div>
              <Link href="/shop/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-4 text-xs text-slate-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Free UK delivery on all orders</div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Cart;