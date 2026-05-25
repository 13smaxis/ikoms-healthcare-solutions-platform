"use client";

import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import WishlistClient from '@/components/WishlistClient';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

export default function WishlistPage() {
  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Wishlist' }]} />
        </div>
      </section>

      <WishlistClient />
    </SiteLayout>
  );
}
