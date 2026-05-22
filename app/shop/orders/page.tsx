"use client";

import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import OrdersClient from '@/components/OrdersClient';

export default function OrdersPage() {
  return (
    <SiteLayout>
      <OrdersClient />
    </SiteLayout>
  );
}
