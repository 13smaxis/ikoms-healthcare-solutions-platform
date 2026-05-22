"use client";

import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import WishlistClient from '@/components/WishlistClient';

export default function WishlistPage() {
  return (
    <SiteLayout>
      <WishlistClient />
    </SiteLayout>
  );
}
