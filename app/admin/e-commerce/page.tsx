"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';
import { getProductImage, getProducts, type ShopProduct } from '@/lib/catergory-products';

type OrderRow = { id: string; status: string; total: number; created_at: string; customer?: { name?: string | null; email?: string | null } | null; items?: Array<unknown> | null; };

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('products');
  const products: ShopProduct[] = getProducts();

  const load = async () => {
    const { data } = await supabase.from('ecom_orders').select('*, customer:ecom_customers(name,email), items:ecom_order_items(*)').order('created_at', { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  const updStatus = async (id: string, status: string) => { await supabase.from('ecom_orders').update({ status }).eq('id', id); load(); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">E-commerce</h1>
          <div className="text-sm text-slate-500 mt-1">Manage orders and products.</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
          <button onClick={() => setView('orders')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'orders' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Orders ({orders.length})</button>
          <button onClick={() => setView('products')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'products' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Products ({products.length})</button>
        </div>
      </div>

      {view === 'orders' ? (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-amber-100">
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="p-3"><div className="font-semibold">{o.customer?.name}</div><div className="text-xs text-slate-500">{o.customer?.email}</div></td>
                  <td className="p-3">{o.items?.length || 0}</td>
                  <td className="p-3 font-bold">{fmt(o.total)}</td>
                  <td className="p-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={e => updStatus(o.id, e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs">
                      <option value="pending">Pending</option><option value="paid">Paid</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-amber-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">{products.length} products</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold flex items-center gap-2">{getProductImage(p) && <img src={getProductImage(p)} className="w-8 h-8 rounded object-cover" />}{p.name}</td>
                  <td className="p-3">{p.product_type}</td>
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3">{fmt(p.price)}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No products yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminOrdersPage;