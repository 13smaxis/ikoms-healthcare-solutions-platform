"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { fmt } from '@/lib/cart';

export default function OrdersClient() {
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
          setUser(data.user);

          try {
            const { data: ordersData } = await supabase
              .from('ecom_orders')
              .select('*')
              .eq('user_id', data.user.id)
              .order('created_at', { ascending: false });

            if (ordersData) {
              setOrders(ordersData);
            }
          } catch (error) {
            console.warn('⚠️ Could not load orders:', error);
            // Continue without orders - page still renders
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };                                                                                                                            //- Wrap in try-catch to handle missing table gracefully

    fetchUserAndOrders();
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="py-20 text-center">Please sign in to view your orders.</div>;
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500">No orders found.</div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-sm text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{fmt(o.total)}</div>
                  <Link href={`/shop/order-confirmation?oid=${o.id}`} className="text-sm text-blue-600">View details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}