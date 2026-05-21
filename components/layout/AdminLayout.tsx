"use client";

import React from 'react';
import Link from 'next/link';
import { Menu, X, Shield } from 'lucide-react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header - app-like, no footer */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg hidden sm:block">IKOMS Admin</span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
                Back to Site
              </Link>
              <button
                className="sm:hidden p-2 text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="sm:hidden border-t border-slate-800 py-3 px-4 space-y-1 bg-slate-800">
            <Link href="/admin" className="block px-3 py-2 text-sm text-white hover:bg-slate-700 rounded">Dashboard</Link>
            <Link href="/admin/jobs" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded">Recruitment</Link>
            <Link href="/admin/courses" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded">Training</Link>
            <Link href="/admin/consultancy" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded">Consultancy</Link>
            <Link href="/admin/orders" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded">E-commerce</Link>
            <Link href="/" className="block px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded">← Back to Site</Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;