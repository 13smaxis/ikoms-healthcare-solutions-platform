"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getProductImage } from '@/lib/catergory-products';

type OrderRow = { id: string; status: string; total: number; created_at: string; customer?: { name?: string | null; email?: string | null } | null; items?: Array<unknown> | null; };
type ProductRow = { id: string; name: string; sku: string; price: number; product_type: string; inventory_qty: number; description: string; images: string[]; status: string; };

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('products');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', price: 0, product_type: '', inventory_qty: 0, description: '', images: [''], status: 'active' });

  const load = async () => {
    const { data } = await supabase.from('ecom_orders').select('*, customer:ecom_customers(name,email), items:ecom_order_items(*)').order('created_at', { ascending: false });
    setOrders(data || []);
    const { data: p } = await supabase.from('ecom_products').select('*').order('created_at', { ascending: false });
    setProducts(p || []);
  };
  useEffect(() => { load(); }, []);

  const updStatus = async (id: string, status: string) => { await supabase.from('ecom_orders').update({ status }).eq('id', id); load(); };
  const updInventory = async (id: string, qty: number) => { await supabase.from('ecom_products').update({ inventory_qty: qty }).eq('id', id); load(); };

  const openAdd = () => { setEditingProduct(null); setForm({ name: '', sku: '', price: 0, product_type: '', inventory_qty: 0, description: '', images: [''], status: 'active' }); setShowModal(true); };
  const openEdit = (p: ProductRow) => { setEditingProduct(p); setForm({ name: p.name, sku: p.sku || '', price: p.price, product_type: p.product_type || '', inventory_qty: p.inventory_qty || 0, description: p.description || '', images: p.images || [''], status: p.status || 'active' }); setShowModal(true); };
  const saveProduct = async () => {
    if (editingProduct) await supabase.from('ecom_products').update(form).eq('id', editingProduct.id);
    else await supabase.from('ecom_products').insert(form);
    setShowModal(false); load();
  };
  const deleteProduct = async (id: string) => { if (confirm('Delete this product?')) { await supabase.from('ecom_products').delete().eq('id', id); load(); } };

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
            <button onClick={openAdd} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"><Plus className="w-4 h-4" /> Add Product</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold flex items-center gap-2">{getProductImage(p) && <img src={getProductImage(p)} className="w-8 h-8 rounded object-cover" />}{p.name}</td>
                  <td className="p-3">{p.product_type}</td>
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3">{fmt(p.price)}</td>
                  <td className="p-3"><input type="number" defaultValue={p.inventory_qty} onBlur={e => updInventory(p.id, Number(e.target.value))} className="w-20 px-2 py-1 border border-slate-300 rounded" /></td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                  <td className="p-3"><div className="flex gap-1"><button onClick={() => openEdit(p)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button><button onClick={() => deleteProduct(p.id)} className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No products yet. Click "Add Product" to create one.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center"><h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3><button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm font-medium mb-1">Product Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Price (£)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Category</label><input value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })} placeholder="e.g. Medical Supplies" className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Stock Qty</label><input type="number" value={form.inventory_qty} onChange={e => setForm({ ...form, inventory_qty: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Image URL</label><input value={form.images[0]} onChange={e => setForm({ ...form, images: [e.target.value] })} placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Cancel</button>
              <button onClick={saveProduct} className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;