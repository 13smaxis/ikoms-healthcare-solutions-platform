"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { fmt } from '@/lib/cart';

export default function AccountClient() {
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        supabase.from('ecom_orders').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
      }
    });
  }, []);

  if (!user) return (
    <div className="py-20 text-center">Please sign in to view your account and orders.</div>
  );

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">My Account</h1>
        <div className="mb-6 text-sm text-slate-600">Signed in as <strong>{user.email}</strong></div>

        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500">No orders yet. Browse <Link href="/shop">products</Link> to place an order.</div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{o.id.slice(0,8)}</div>
                  <div className="text-sm text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{fmt(o.total)}</div>
                  <Link href={`/shop/order-confirmation?oid=${o.id}`} className="text-sm text-blue-600">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
