"use client";

import React from 'react';

export default function ShopImageMarquee({ images, title }: { images: string[]; title?: string }) {
  const doubled = [...images, ...images];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white py-4 sm:py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-white to-transparent" />
      <div className="mb-3 px-4 sm:px-5">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-700">{title || 'Shop gallery'}</div>
      </div>
      <div className="flex w-max animate-marquee gap-4 px-4 sm:px-5">
        {doubled.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="flex h-28 w-44 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-52"
          >
            <img src={src} alt="Shop showcase" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}