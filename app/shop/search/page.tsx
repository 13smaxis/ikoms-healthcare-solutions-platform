"use client";

import React from 'react';
import { Suspense } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import SearchClient from '@/components/SearchClient';

export default function SearchPage() {
  return (
    <SiteLayout>
      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </SiteLayout>
  );
}
