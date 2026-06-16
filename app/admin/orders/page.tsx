"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';
import { addProduct, getProductImage, getProducts, normalizeShopTag, updateProduct, type ShopProduct } from '@/lib/catergory-products';
import ProductForm from '@/components/admin/ProductForm';
import { X, Edit2 } from 'lucide-react';

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer?: { name?: string | null; email?: string | null } | null;
  items?: Array<unknown> | null;
};

const emptyProductForm: ShopProduct = {
  id: '',
  handle: '',
  name: '',
  sku: '',
  product_type: '',
  collectionHandle: '',
  price: 0,
  images: [''],
  tags: [],
  description: '',
  model: '',
  key_features: [],
  medical_information: '',
  status: 'active',
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [form, setForm] = useState<ShopProduct>(emptyProductForm);
  const [showModal, setShowModal] = useState(false);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('ecom_orders')
      .select('*, customer:ecom_customers(name,email), items:ecom_order_items(*)')
      .order('created_at', { ascending: false });

    setOrders(data || []);
  };

  const loadProducts = () => {
    setProducts([...getProducts(true)]);
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const updStatus = async (id: string, status: string) => {
    await supabase.from('ecom_orders').update({ status }).eq('id', id);
    loadOrders();
  };

  const openEdit = (product: ShopProduct) => {
    setEditing(product);
    setForm({
      ...product,
      tags: product.tags || [],
      images: product.images?.length ? product.images : [''],
      key_features: product.key_features || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyProductForm);
  };

  const saveProduct = (p: ShopProduct) => {
    const result = p.id && getProducts(true).find((x) => x.id === p.id) ? updateProduct(p) : addProduct(p);
    if (result) {
      loadProducts();
      closeModal();
    }
  };

  const productCount = products.length;
  const orderCount = orders.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">E-commerce</h1>
          <div className="text-sm text-slate-500 mt-1">Manage orders and shared shop products.</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
          <button
            onClick={() => setView('orders')}
            className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'orders' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            Orders ({orderCount})
          </button>
          <button
            onClick={() => setView('products')}
            className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'products' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            Products ({productCount})
          </button>
        </div>
      </div>

      {view === 'orders' ? (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left">
                <th className="p-3">Order</th>
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
                  <td className="p-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
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
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-amber-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">{productCount} products</span>
            <button
              onClick={() => {
                setEditing(null);
                setForm(emptyProductForm);
                setShowModal(true);
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Add product
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold flex items-center gap-2">
                    {getProductImage(p) ? (
                      <img src={getProductImage(p)} className="w-8 h-8 rounded object-cover" alt={p.name} />
                    ) : null}
                    {p.name}
                  </td>
                  <td className="p-3">{p.product_type}</td>
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3">{fmt(p.price)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <ProductForm product={editing} onSave={saveProduct} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
