"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useProductAPI } from '@/hooks/useProductAPI';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Product } from '@/types/database';
import { Plus, Edit2, Trash2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

const ProductsPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="manager">
      <ProductsContent />
    </ProtectedRoute>
  );
};

const ProductsContent: React.FC = () => {
  const { storeid } = useAuth();
  const { getProductsByStore, deleteProduct, loading: apiLoading, error: apiError } = useProductAPI();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(apiError || null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeid) return;
      
      const data = await getProductsByStore(storeid);
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [storeid, getProductsByStore]);

  const handleDelete = async (productid: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(productid);
    const success = await deleteProduct(productid);
    setDeleting(null);

    if (success) {
      setProducts((prev) => prev.filter((p) => p.productid !== productid));
    } else {
      setError('Failed to delete product');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      case 'archived':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500 mt-1">Manage products in your store</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-slate-500 mb-4">No products yet</p>
            <Link
              href="/admin/products/new"
              className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.productid} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{product.handle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                          {product.sku}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(product.createdat).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.productid}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.productid)}
                            disabled={deleting === product.productid}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            {deleting === product.productid ? (
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
    </div>
  );
};

export default ProductsPage;