"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';
import {
  getProductImage,
  getProducts,
  type ShopProduct
} from '@/lib/category-products';
import { Eye } from 'lucide-react';

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer?: { name?: string | null; email?: string | null } | null;
  items?: Array<unknown> | null;
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('ecom_orders')
      .select('*, customer:ecom_customers(name,email), items:ecom_order_items(*)')
      .order('created_at', { ascending: false });

    setOrders(data || []);
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts(false); // false = only published products
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadOrders(), loadProducts()]);
      setLoading(false);
    };
    init();
  }, []);

  const updStatus = async (id: string, status: string) => {
    await supabase.from('ecom_orders').update({ status }).eq('id', id);
    loadOrders();
  };

  const productCount = products.length;
  const orderCount = orders.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500">E-commerce</h1>
          <div className="text-sm text-white mt-1">View orders and published shop products.</div>
        </div>
      </div>

      <div className="bg-white rounded-xl mb-6 overflow-x-auto">                                                                  {/* Tab Navigation */}
        <div className="flex items-center">                                                                                       {/* Tab Buttons */}
          <button
            onClick={() => setView('products')}
            className={`
              inline-flex 
              items-center 
              px-5 py-3 
              text-sm 
              font-semibold 
              border-b-2 
              transition 
              whitespace-nowrap 
              ${view === 'products'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
              }
            `}
          >                                                                                                                       {/* Tab Button for Products */}
            Products ({productCount})
          </button>
          <button
            onClick={() => setView('orders')}
            className={`
                        inline-flex 
                        items-center 
                        px-5 py-3 
                        text-sm 
                        font-semibold 
                        border-b-2 
                        transition 
                        whitespace-nowrap 
                        ${view === 'orders'
                          ? 'border-blue-700 text-blue-700'
                          : 'border-transparent text-slate-600 hover:text-slate-900'}
                    `}
          >                                                                                                                       {/* Tab Button for Orders */}
            Orders ({orderCount})
          </button>
        </div>
      </div>

      {view === 'orders' ? (
        <div className="bg-amber-50/50 rounded-xl overflow-hidden">                                                               {/* Orders View */}
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-amber-100">
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="p-3">
                    <div className="font-semibold">{o.customer?.name || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{o.customer?.email || '—'}</div>
                  </td>
                  <td className="p-3">{o.items?.length || 0}</td>
                  <td className="p-3 font-bold">{fmt(o.total)}</td>
                  <td className="p-3 text-xs text-slate-500">
                    {new Date(o.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updStatus(o.id, e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        
        <div className="bg-amber-50/50 rounded-xl overflow-hidden">                                                               {/* Products View */}
          <div className="p-3 border-b border-amber-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">{productCount} published products</span>
            <a
              href="/admin/products/new"
              className="
                          rounded-lg 
                          bg-emerald-600 
                          px-4 py-2 
                          text-sm 
                          font-semibold 
                          text-white 
                          hover:bg-emerald-700 
                          transition
                        "
            >
              + Add Product
            </a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-amber-100 hover:bg-amber-50/50">
                  <td className="p-3 font-semibold flex items-center gap-2">
                    {getProductImage(p) && (
                      <img
                        src={getProductImage(p)}
                        className="w-8 h-8 rounded object-cover"
                        alt={p.name}
                      />
                    )}
                    {p.name}
                  </td>
                  <td className="p-3">{p.product_type}</td>
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3 font-bold">{fmt(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'draft'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {p.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3">
                    <a
                      href={`/admin/products/${p.productid}/edit`}
                      className="
                                  inline-flex 
                                  items-center 
                                  gap-2 
                                  rounded-lg 
                                  border border-slate-300 
                                  bg-white 
                                  px-3 py-1 
                                  text-xs 
                                  font-semibold text-slate-700 
                                  hover:border-slate-400 hover:bg-slate-50 transition
                                "
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No published products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;