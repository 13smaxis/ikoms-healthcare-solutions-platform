"use client";

import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import AccountClient from '@/components/AccountClient';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

export default function AccountPage() {
  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Account' }]} />
        </div>
      </section>

      <AccountClient />
    </SiteLayout>
  );
}
