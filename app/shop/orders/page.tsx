"use client";

import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import OrdersClient from '@/components/OrdersClient';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

export default function OrdersPage() {
  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Orders' }]} />
        </div>
      </section>

      <OrdersClient />
    </SiteLayout>
  );
}
