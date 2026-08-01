"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';
import ShopProductSpecification from '@/components/ShopProductSpecification';
import { useAuth } from '@/contexts/AuthContext';
import { useProductAPI } from '@/hooks/useProductAPI';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProductFormCreate from '@/components/ProductFormCreate';
import ProductFormEdit from '@/components/ProductFormEdit';
import { getProductImage, getProducts, type ShopProduct } from '@/lib/category-products';
import { AlertTriangle, Eye, Edit3, Trash2 } from 'lucide-react';

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer?: { name?: string | null; email?: string | null } | null;
  items?: Array<unknown> | null;
};

const AdminOrdersPage: React.FC = () => {
  const { storeid } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProduct, setViewingProduct] = useState<ShopProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<ShopProduct | null>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { deleteProduct } = useProductAPI();

  const loadOrders = async () => {
    try {
      console.log('📋 Starting loadOrders...');
      const { data, error } = await supabase
        .from('ecom_orders')
        .select('*, customer:ecom_customers(name,email), items:ecom_order_items(*)')
        .order('created_at', { ascending: false });

      console.log('✅ loadOrders done:', data?.length);
      if (error) {
        setOrders([]);
        return;
      }

      setOrders((data || []) as OrderRow[]);
    } catch (err) {
      console.error('❌ loadOrders failed:', err);
      setOrders([]);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('📦 Starting loadProducts...');
      const data = await getProducts(false);
      console.log('✅ loadProducts done:', data.length);
      setProducts(data);
    } catch (err) {
      console.error('❌ loadProducts failed:', err);
      setProducts([]);
    }
  };

  const handleViewProduct = (product: ShopProduct) => {
    setViewingProduct(product);
  };

  const handleEditProduct = (product: ShopProduct) => {
    setEditingProduct(product);
  };

  const handleRequestDeleteProduct = (product: ShopProduct) => {
    setPendingDeleteProduct(product);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!pendingDeleteProduct) return;

    setActionLoading(true);
    setActionError(null);

    const success = await deleteProduct(pendingDeleteProduct.id);
    if (!success) {
      setActionError('Failed to delete product. Please try again.');
      setActionLoading(false);
      return;
    }

    setPendingDeleteProduct(null);
    await loadProducts();
    setActionLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        await Promise.all([loadOrders(), loadProducts()]);
      } catch (err) {
        console.error('E-commerce page init failed:', err);
      } finally {
        setLoading(false);
      }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
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

      <div className="bg-white rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
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
          >
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
          >
            Orders ({orderCount})
          </button>
        </div>
      </div>

      {view === 'orders' ? (
        <div className="bg-amber-50/50 rounded-xl overflow-hidden">
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
        <div className="bg-amber-50/50 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-amber-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">{productCount} published products</span>
            <button
              type="button"
              onClick={() => {
                setShowCreateProductModal(true);
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              + Add Product
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewProduct(p)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditProduct(p)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDeleteProduct(p)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
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

      <Dialog open={Boolean(viewingProduct)} onOpenChange={(open) => { if (!open) setViewingProduct(null); }}>
        <DialogContent className="max-w-6xl border-slate-200/80 bg-white/95 p-0 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.35)] sm:rounded-[28px]">
          <DialogHeader>
            <DialogTitle>Product preview</DialogTitle>
            <DialogDescription>Review this product without leaving the E-commerce page.</DialogDescription>
          </DialogHeader>
          {viewingProduct ? (
            <div className="max-h-[70vh] overflow-y-auto">
              <ShopProductSpecification
                product={viewingProduct}
                category={undefined}
                categories={[]}
                relatedProducts={[]}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
        <DialogContent className="max-h-[90vh] max-w-4xl border-white/10 bg-slate-950 p-0 text-white shadow-2xl shadow-black/30 sm:rounded-3xl">
          {editingProduct ? (
            <ProductFormEdit
              product={editingProduct}
              storeid={storeid || ''}
              onSuccess={loadProducts}
              onClose={() => setEditingProduct(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateProductModal} onOpenChange={(open) => { if (!open) setShowCreateProductModal(false); }}>
        <DialogContent className="max-h-[90vh] max-w-4xl border-white/10 bg-slate-950 p-0 text-white shadow-2xl shadow-black/30 sm:rounded-3xl">
          <ProductFormCreate
            storeid={storeid || ''}
            onSuccess={loadProducts}
            onClose={() => setShowCreateProductModal(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDeleteProduct)} onOpenChange={(open) => { if (!open) setPendingDeleteProduct(null); }}>
        <AlertDialogContent className="max-w-lg border border-white/10 bg-slate-950/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-rose-600/20 via-slate-900/90 to-orange-500/20 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/15 text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-white">Confirm delete</AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-sm leading-6 text-slate-300">Deleting this product is permanent and will remove it from the catalog.</AlertDialogDescription>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-500/10 via-slate-900/80 to-orange-500/10 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Please review before continuing</p>
              <p className="mt-2 leading-6 text-slate-300">This action cannot be undone. The product will be removed from your store immediately after confirmation.</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                <li>• Existing listings and references will be removed.</li>
                <li>• The deletion is submitted immediately after confirmation.</li>
                <li>• You can cancel at any time.</li>
              </ul>
            </div>
            {actionError ? <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{actionError}</p> : null}
          </div>
          <AlertDialogFooter className="border-t border-white/10 px-6 py-4">
            <AlertDialogCancel className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleConfirmDeleteProduct}
              disabled={actionLoading}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default AdminOrdersPage;