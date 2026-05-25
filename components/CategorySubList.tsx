"use client";

import React from 'react';
import Link from 'next/link';

export default function CategorySubList({ title, items, handle }: { title: string; items: string[]; handle: string }) {
  const categoryItems = items.filter((item) => item !== 'Products');

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <Link
          href="/shop/products"
          className="block rounded-lg border border-slate-200 bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
        >
          Products
        </Link>
        {categoryItems.map((it) => (
          <Link
            key={it}
            href={`/shop/products?tag=${encodeURIComponent(it)}`}
            className="block rounded-lg border border-slate-200 bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
          >
            {it}
          </Link>
        ))}
      </div>
    </section>
  );
}
