"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryByHandle } from '@/lib/categories';

export default function ShopCategoryIntro({ handle }: { handle: string }) {
  const category = getCategoryByHandle(handle);

  return (
    <section className="space-y-4 py-6 sm:py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-700">Category</div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{category?.title || 'Shop collection'}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse products in this category. Product data and images now come directly from the product source.
            </p>
          </div>
          <Link href="/shop/products" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-800">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
