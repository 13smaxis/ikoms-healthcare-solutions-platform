"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Users, Package, ShoppingCart, Settings } from 'lucide-react';
import { fmt } from '@/lib/cart';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProductForm from '@/components/ProductForm';

type TeamMember = {
  id: string | number;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

interface DashboardStats {
  products: number;
  orders: number;
  customers: number;
  collections: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { profile, isManager, loading, hydrating } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    customers: 0,
    collections: 0,
    totalRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [createProductError, setCreateProductError] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        return null;
      }
      return data.session.access_token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  const handleCreateProduct = async (product: any) => {
    if (!profile?.store_id) {
      setCreateProductError('Store ID not found');
      return;
    }

    setSavingProduct(true);
    setCreateProductError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated - please log in');
      }

      const payload = {
        name: product.name,
        handle: product.handle,
        sku: product.sku,
        price: product.price,
        description: product.description || '',
        producttypeid: product.product_type || '',
        model: product.model || '',
        medical_information: product.medical_information || '',
        status: product.status || 'active',
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeid: profile.store_id,
          ...payload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setShowCreateProductModal(false);
      setStats((prev) => ({ ...prev, products: prev.products + 1 }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setCreateProductError(message);
    } finally {
      setSavingProduct(false);
    }
  };

  useEffect(() => {
    if (!isManager) return; // Only load if user is manager

    (async () => {
      try {
        setStatsLoading(true);
        setError(null);

        // Fetch stats from actual tables in your schema
        const [
          { count: productCount },
          { count: orderCount },
          { count: customerCount },
          { count: collectionCount },
          { data: orderData }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('collections').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('totalamount'),
        ]);

        const revenue = (orderData || []).reduce(
          (sum, order) => sum + (parseFloat(order.totalamount) || 0),
          0
        );

        setStats({
          products: productCount || 0,
          orders: orderCount || 0,
          customers: customerCount || 0,
          collections: collectionCount || 0,
          totalRevenue: revenue,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [isManager]);

  if (loading || hydrating) {
    return (
      <div className="w-full max-w-7xl px-4 py-8">
        <div className="text-center text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="w-full max-w-7xl px-4 py-8">
        <div className="text-center text-red-600">
          Access denied. Manager privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-yellow-500">Dashboard</h1>
        <p className="text-white mt-2">
          Welcome, {profile?.name || 'Manager'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package className="text-blue-600" size={24} />}
          label="Products"
          value={stats.products}
          href="/admin/products"
        />
        <StatCard
          icon={<ShoppingCart className="text-green-600" size={24} />}
          label="Orders"
          value={stats.orders}
          href="/admin/e-commerce"
        />
        <StatCard
          icon={<Users className="text-purple-600" size={24} />}
          label="Customers"
          value={stats.customers}
          href="/admin/customers"
        />
        <StatCard
          icon={<Settings className="text-orange-600" size={24} />}
          label="Collections"
          value={stats.collections}
          href="/admin/collections"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Total Revenue</h2>
        <p className="text-4xl font-bold text-green-600 mt-4">
          R {stats.totalRevenue.toFixed(2)}
        </p>
        <p className="text-sm text-slate-500 mt-2">From {stats.orders} orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                                                                     {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setCreateProductError(null);
                setShowCreateProductModal(true);
              }}
              className="block w-full text-left px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ➕ Add Product
            </button>
            <Link
              href="/admin/collections/new"
              className="block px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ➕ Create Collection
            </Link>
            <Link
              href="/admin/e-commerce"
              className="block px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              📦 View Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">User Info</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Name:</span>{' '}
              <span className="text-slate-600">{profile?.name}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-700">Email:</span>{' '}
              <span className="text-slate-600">{profile?.email}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-700">Role:</span>{' '}
              <span className="text-slate-600 capitalize">{profile?.usertype}</span>
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showCreateProductModal} onOpenChange={(open) => { if (!open) setShowCreateProductModal(false); }}>
        <DialogContent className="max-w-4xl border-slate-200/80 bg-white/95 p-0 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.35)] sm:rounded-[28px]">
          <DialogHeader>
            <DialogTitle>Add new product</DialogTitle>
            <DialogDescription>Create a new product and publish it to the storefront.</DialogDescription>
          </DialogHeader>
          {createProductError ? (
            <div className="px-6 pb-2 text-sm text-rose-600">{createProductError}</div>
          ) : null}
          <ProductForm
            storeid={profile?.store_id || ''}
            onSave={handleCreateProduct}
            onClose={() => setShowCreateProductModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}

function StatCard({ icon, label, value, href }: StatCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
          <div>{icon}</div>
        </div>
      </div>
    </Link>
  );
}

export default AdminDashboard;