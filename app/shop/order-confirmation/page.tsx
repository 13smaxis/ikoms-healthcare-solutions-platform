"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Package } from 'lucide-react';
import { fmt } from '@/lib/cart';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const OrderConfirmation: React.FC = () => {
  const [oid, setOid] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOid(params.get('oid'));
  }, []);

  useEffect(() => {
    if (!oid) {
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        const [orderRes, itemsRes] = await Promise.all([
          supabase.from('ecom_orders' as any).select('*').eq('id', oid).single(),
          supabase.from('ecom_order_items' as any).select('*').eq('order_id', oid),
        ]);

        const orderData = orderRes as { data?: any } | null | undefined;
        const itemsData = itemsRes as { data?: any[] } | null | undefined;

        if (orderData?.data) setOrder(orderData.data);
        if (itemsData?.data) setItems(itemsData.data);
      } catch (error) {
        console.warn('⚠️ Could not load order data:', error);
        // Continue without order data - page still renders
      } finally {
        setLoading(false);                                                                                                        //- Set loading to false once data is fetched (success or failure)
      }
    };                                                                                                                            //- Wrap in try-catch to prevent crashes if table doesn't exist

    fetchOrderData();
  }, [oid]);

  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Order confirmation' }]} />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank you — your order is confirmed!</h1>
          <p className="text-slate-600">We've emailed you a receipt and will notify you when your order ships.</p>
        </div>

        {!loading && order && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-500">Order number</div>
                <div className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total</div>
                <div className="font-bold text-lg">{fmt(order.total)}</div>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <div><Package className="w-4 h-4 inline mr-1 text-slate-400" /> {i.product_name} × {i.quantity}</div>
                  <div className="font-semibold">{fmt(i.total)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/shop" className="px-6 py-3 bg-rose-700 text-white rounded-lg font-semibold inline-block">Continue shopping</Link>
        </div>
      </div>
    </SiteLayout>
  );
};

export default OrderConfirmation;