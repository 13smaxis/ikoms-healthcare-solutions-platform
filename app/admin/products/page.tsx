"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProductAPI } from '@/hooks/useProductAPI';
import ProductFormCreate from '@/components/ProductFormCreate';
import ProductFormEdit from '@/components/ProductFormEdit';
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
import { getProductImage, type ShopProduct } from '@/lib/category-products';
import { fmt } from '@/lib/cart';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ProductsPage: React.FC = () => (
  <ProtectedRoute requiredRole="manager">
    <ProductsContent />
  </ProtectedRoute>
);

const ProductsContent: React.FC = () => {
  const { storeid } = useAuth();
  const { getProductsByStore, deleteProduct, error: apiError } = useProductAPI();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<ShopProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(apiError);
  }, [apiError]);

  // Load products on mount or when storeid changes
  useEffect(() => {
    const loadProducts = async () => {
      console.log('Admin products load start', { storeid });
      if (!storeid) {
        console.warn('Admin products load aborted because storeid is missing');
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      const data = await getProductsByStore(storeid);
      if (data) {
        console.log('Admin products load success', { count: data.length });
        setProducts(data);
      } else {
        console.warn('Admin products load returned no data');
      }
      setLoadingProducts(false);
      console.log('Admin products load finished');
    };

    loadProducts();
  }, [getProductsByStore, storeid]);

  const handleOpenModal = (product?: ShopProduct) => {
    setSelectedProduct(product ?? null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const refreshProducts = async () => {
    if (!storeid) return;
    const updatedProducts = await getProductsByStore(storeid);
    if (updatedProducts) setProducts(updatedProducts);
  };

  useEffect(() => {
    const handleSoftFocusRefresh = () => {
      if (!storeid) return;
      console.log('[ProductsPage] soft focus refresh received — refreshing product list silently');
      refreshProducts();
    };

    window.addEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);
    return () => {
      window.removeEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);
    };
  }, [storeid, getProductsByStore]);

  const handleDeleteProduct = (product: ShopProduct) => {
    setPendingDeleteProduct(product);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!pendingDeleteProduct) return;

    setDeleting(pendingDeleteProduct.id);
    const success = await deleteProduct(pendingDeleteProduct.id);
    setDeleting(null);

    if (!success) {
      setError('Failed to delete product. Please try again.');
      setPendingDeleteProduct(null);
      return;
    }

    setProducts((prev) => prev.filter((product) => product.id !== pendingDeleteProduct.id));
    setPendingDeleteProduct(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft size={18} /> Back to dashboard
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500 mt-1">Manage products for your store.</p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} /> Add product
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loadingProducts ? (
          <div className="flex items-center justify-center min-h-[240px] rounded-3xl bg-white shadow-sm">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4" />
              <p className="text-slate-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <p className="text-slate-500 mb-4">No products have been added for this store yet.</p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Product</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">SKU</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Created</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getProductImage(product) ? (
                            <img src={getProductImage(product)} alt={product.name} className="h-10 w-10 rounded object-cover" />
                          ) : null}
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{product.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">{product.sku}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{fmt(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{product.created_at ? new Date(product.created_at).toLocaleDateString('en-GB') : '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deleting === product.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            {deleting === product.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.38)]">
            {selectedProduct ? (
              <ProductFormEdit
                product={selectedProduct}
                storeid={storeid || ''}
                onSuccess={refreshProducts}
                onClose={handleCloseModal}
              />
            ) : (
              <ProductFormCreate
                storeid={storeid || ''}
                onSuccess={refreshProducts}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      )}

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
            {error ? <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p> : null}
          </div>
          <AlertDialogFooter className="border-t border-white/10 px-6 py-4">
            <AlertDialogCancel className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleConfirmDeleteProduct} disabled={Boolean(deleting)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? 'Deleting...' : 'Confirm delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;