"use client";

import React from 'react';

export default function ShopImageMarquee({ images, title }: { images: string[]; title?: string }) {
  const doubled = [...images, ...images, ...images];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white py-4 sm:py-5">
      <div className="
                        pointer-events-none 
                        absolute inset-y-0 
                        left-0 
                        z-10 w-24 
                        bg-linear-to-r 
                        from-white to-transparent
                    " 
    />
      <div className="
                        pointer-events-none 
                        absolute 
                        inset-y-0 
                        right-0 
                        z-10 w-24 
                        bg-linear-to-l from-white to-transparent
                    " 
    />
      <div className="flex w-max animate-marquee px-0">
        {doubled.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="flex h-16 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-14 sm:w-28"
          >
            <img src={src} alt="Shop showcase" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}