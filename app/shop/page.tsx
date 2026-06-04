"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { UserCircle2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';
import BenefitsMarquee from '@/components/ShopMarquee';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import { getProductImage } from '@/lib/products';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const ShopHome: React.FC = () => {
  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: getProductImage(p) }, 1);
  };

  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <SiteLayout>
      <section className="relative bg-linear-to-br from-rose-800 to-pink-700 text-white py-10">           {/* Hero section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }]} />
        </div>
        <div
          className="
                      absolute 
                      inset-0 
                      opacity-20 
                      bg-cover bg-center bg-fixed
                    "
          style={
                  { backgroundImage: 'url(https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600)' }
                }
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">
            Clinical supplies, delivered fast
          </h1>
          <p className="text-lg text-pink-100 max-w-2xl mb-8">
            PPE, equipment, uniforms, books and digital toolkits
            — everything healthcare teams need, in one store.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop/account"
              className="
                              inline-flex items-center gap-2 flex-nowrap whitespace-nowrap 
                              text-sm font-semibold text-slate-700 
                              px-4 py-2 
                              bg-white/90 
                              rounded-full 
                              shadow-sm shrink-0
                              hover:bg-slate-100
                            "
            >
              <UserCircle2 size={20} className="shrink-0" />
              Account
            </Link>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) router.push(`/shop/search?q=${encodeURIComponent(q)}`);
              }}
              className="
                flex items-center
                min-w-0
                bg-white
                border border-slate-200
                rounded-lg
                overflow-hidden
              "
            >
              <input
                name="q"
                value={q}
                onChange={e => setQ(e.target.value)} placeholder="Search products..."
                className="text-gray-500 px-3 py-2 text-sm w-44 sm:w-64 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-2 text-gray-500 text-sm">
                <Search className="w-4 h-4" /></button>
            </form>

            <ShopOverlayMenu />                                                                                 {/* Hamburger menu for mobile */}
          </div>
        </div>
      </section>

      <BenefitsMarquee />                                                                                       {/* Marquee of trust badges */}
    </SiteLayout>
  );
};

export default ShopHome;