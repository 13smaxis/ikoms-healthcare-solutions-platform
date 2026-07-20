"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Users, Package, ShoppingCart, Settings } from 'lucide-react';
import { fmt } from '@/lib/cart';
import { useAuth } from '@/contexts/AuthContext';

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
          href="/admin/orders"
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/admin/products/new"
              className="block px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ➕ Add Product
            </Link>
            <Link
              href="/admin/collections/new"
              className="block px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              ➕ Create Collection
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              📦 View Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Store Info</h3>
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
              <span className="font-semibold text-slate-700">Type:</span>{' '}
              <span className="text-slate-600 capitalize">{profile?.usertype}</span>
            </p>
          </div>
        </div>
      </div>
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


/*const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(
                                      { jobs: 0, apps: 0, courses: 0, bookings: 0, 
                                        topics: 0, cbookings: 0, orders: 0, revenue: 0 
                                      }
                                    );
  
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); 

  useEffect(() => {
    (async () => {
      const [
              { count: jobs }, { count: apps }, { count: courses }, { count: bookings }, { count: topics }, 
              { count: cbookings }, { data: orders }
            ] = await Promise.all
      ([
        supabase.from('biz_jobs').select('*', { count: 'exact', head: true }),
        supabase.from('biz_applications').select('*', { count: 'exact', head: true }),
        supabase.from('biz_courses').select('*', { count: 'exact', head: true }),
        supabase.from('biz_course_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('biz_consultancy_topics').select('*', { count: 'exact', head: true }),
        supabase.from('biz_consultancy_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('ecom_orders').select('total'),
      ]);

      setStats({
        jobs: jobs || 0,
        apps: apps || 0,
        courses: courses || 0,
        bookings: bookings || 0,
        topics: topics || 0,
        cbookings: cbookings || 0,
        orders: orders?.length || 0,
        revenue: (orders || []).reduce((sum, order) => sum + (order.total || 0), 0),
      });
    })();
  }, []);

  useEffect(() => {
    supabase.from('admin_users').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setTeamMembers(data || []));
  }, []);

  return (
    <div className="w-full max-w-7xl px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { l: 'Active jobs', v: stats.jobs, s: `${stats.apps} applications`, c: 'bg-blue-700 text-white' },
              { l: 'Courses', v: stats.courses, s: `${stats.bookings} bookings`, c: 'bg-emerald-600 text-white' },
              { l: 'Consultancy services', v: stats.topics, s: `${stats.cbookings} bookings`, c: 'bg-indigo-600 text-white' },
              { l: 'Shop revenue', v: fmt(stats.revenue), s: `${stats.orders} orders`, c: 'bg-rose-600 text-white' },
            ].map((card, index) => (
              <div key={index} className={`rounded-xl p-5 ${card.c}`}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{card.l}</div>
                <div className="text-3xl font-bold">{card.v}</div>
                <div className="text-xs opacity-80 mt-1">{card.s}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">                               {/* Quick actions section 
              <h3 className="font-bold text-slate-900 mb-3">Quick actions</h3>
              <div className="space-y-2 text-sm">
                <Link href="/admin/jobs" 
                      className="block px-3 py-2 hover:bg-slate-50 rounded">
                        Post a new job →
                </Link>
                <Link href="/admin/courses" 
                      className="block px-3 py-2 hover:bg-slate-50 rounded">
                        Add a training course →
                </Link>
                <Link href="/admin/consultancy" 
                      className="block px-3 py-2 hover:bg-slate-50 rounded">
                        Add a consultancy service →
                </Link>
                <Link href="/admin/orders" 
                      className="block px-3 py-2 hover:bg-slate-50 rounded">
                        Manage E-commerce →
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">                               {/* Jump to public pages section 
              <h3 className="font-bold text-slate-900 mb-3">Jump to public pages</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/" className="px-3 py-2 hover:bg-slate-50 rounded">Home</Link>
                <Link href="/recruitment" className="px-3 py-2 hover:bg-slate-50 rounded">Recruitment</Link>
                <Link href="/training" className="px-3 py-2 hover:bg-slate-50 rounded">Training</Link>
                <Link href="/consultancy" className="px-3 py-2 hover:bg-slate-50 rounded">Consultancy</Link>
                <Link href="/shop" className="px-3 py-2 hover:bg-slate-50 rounded">Shop</Link>
                <Link href="/contact" className="px-3 py-2 hover:bg-slate-50 rounded">Contact</Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">                                 {/* Admin team members section 
            <h3 className="font-bold text-slate-900 mb-3">Admin team members</h3>
            <p className="text-xs text-slate-500 mb-4">
                Users with records in admin_users are listed here for reference.
            </p>
            <table className="w-full text-sm">
              <thead className="bg-amber-100/60 border-b border-amber-200">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(member => (
                  <tr key={member.id} className="border-b border-amber-100">
                    <td className="p-3">{member.full_name || '—'}</td>
                    <td className="p-3">{member.email}</td>
                    <td className="p-3"><span className="
                                                          text-xs 
                                                          px-2 py-0.5 
                                                          bg-blue-100 
                                                          text-blue-700 
                                                          rounded-full">{member.role || 'admin'}
                                        </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                        {member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
                {teamMembers.length === 0 && 
                <tr>
                  <td colSpan={4} 
                      className="p-6 text-center text-slate-500">
                        No admin profiles found in backend yet.
                  </td>
                </tr>}
              </tbody>
            </table>
          </div>
      </div>
  );
};

export default AdminDashboard;*/