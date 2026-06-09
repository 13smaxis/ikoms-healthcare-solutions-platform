"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { UserCircle2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';
import BenefitsMarquee from '@/components/TrustBadgesMarquee';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import { getProductImage, getProducts } from '@/lib/catergory-products';
import type { ShopProduct } from '@/lib/catergory-products';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const ShopHome: React.FC = () => {
  const products: ShopProduct[] = getProducts();
  const quickAdd = (p: ShopProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
              { product_id: p.id, 
                name: p.name, 
                sku: p.sku, 
                price: p.price, 
                image: getProductImage(p) 
              }, 
            1);
  };

  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <SiteLayout>
      <section className="relative bg-linear-to-br from-rose-800 to-pink-700 text-white py-10">          {/* Hero section */}
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
            WELCOME TO 
              <span className="text-rose-400">
                <br/>IKOMS HEALTHCARE
              </span>
                <br/>SUPPLY STORE
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
                <Search className="w-4 h-4" />
              </button>
            </form>

            <ShopOverlayMenu />                                                                                 {/* Hamburger menu for mobile */}
          
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Browse products</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="
                                                group 
                                                overflow-hidden 
                                                rounded-3xl 
                                                border border-slate-200 
                                                bg-white 
                                                shadow-sm 
                                                transition 
                                                hover:-translate-y-0.5 hover:shadow-md
                                                "
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="
                                w-full h-full object-contain object-center transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{product.product_type}</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-rose-600">R{(product.price / 100).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={(e) => quickAdd(product, e)}
                      className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BenefitsMarquee />                                                                                       {/* Marquee of trust badges */}
    
    </SiteLayout>
  );
};

export default ShopHome;