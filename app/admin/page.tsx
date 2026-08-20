"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/auth/client';
import { formatPounds } from '@/lib/cart';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import ProductFormCreate from '@/components/ProductFormCreate';

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
  bookings: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { profile, isManager, loading, hydrating } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    customers: 0,
    bookings: 0,
    totalRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  useEffect(() => {
    if (!isManager) return;                                                                                                       //- Only load if user is manager

    (async () => {
      console.log('Dashboard stats load start', { isManager });
      try {
        setStatsLoading(true);                                                                                                    //- Set loading state to true before fetching stats
        setError(null);

        const token = await getAuthToken();
        if (!token) throw new Error('Admin session is unavailable');

        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to load dashboard statistics');

        setStats(result);
        console.log('Dashboard stats load success', result);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
        console.log('Dashboard stats load finished');
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
          icon={<CalendarDays className="text-orange-600" size={24} />}
          label="Bookings"
          value={stats.bookings}
          href="/admin/consultancy"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Total Revenue</h2>
        <p className="text-4xl font-bold text-green-600 mt-4">
          {formatPounds(stats.totalRevenue)}
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
                setShowCreateProductModal(true);
              }}
              className="block w-full text-left px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ➕ Add Product
            </button>
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
        <DialogContent className="max-h-[90vh] max-w-4xl border-white/10 bg-slate-950 p-0 text-white shadow-2xl shadow-black/30 sm:rounded-3xl">
          <ProductFormCreate
            storeid={profile?.storeid || ''}
            onSuccess={() => setStats((prev) => ({ ...prev, products: prev.products + 1 }))}
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