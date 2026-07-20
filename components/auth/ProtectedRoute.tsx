"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'staff' | 'admin';
}

export function ProtectedRoute({ children, requiredRole = 'manager' }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/admin');
    return null;
  }

  const hasAccess =
    (requiredRole === 'manager' && role === 'manager') ||
    (requiredRole === 'staff' && ['manager', 'staff', 'supervisor'].includes(role || '')) ||
    (requiredRole === 'admin' && ['manager', 'staff', 'supervisor'].includes(role || ''));

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">
            You don't have permission to access this area. Required role: {requiredRole}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}