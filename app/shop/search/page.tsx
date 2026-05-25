"use client";

import React from 'react';
import { Suspense } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import SearchClient from '@/components/SearchClient';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

export default function SearchPage() {
  return (
    <SiteLayout>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Search' }]} />
        </div>
      </section>

      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </SiteLayout>
  );
}
