"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { UserCircle2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';
import BenefitsMarquee from '@/components/TrustBadgesMarquee';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import ShopProductCard from '@/components/ShopProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProductImage, getProducts } from '@/lib/category-products';
import type { ShopProduct } from '@/lib/category-products';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';

const shopHeroImageUrl =
'https://image.pollinations.ai/prompt/photorealistic%20healthcare%20supply%20store%20hero%20background%20with%20wheelchair,%20first%20aid%20kit,%20stethoscope,%20blood%20pressure%20monitor,%20thermometer,%20medical%20gloves,%20face%20mask,%20walker,%20crutches,%20hospital%20equipment,%20clean%20white%20and%20blue%20theme,%20modern,%20minimal,%20professional,%20wide%2016:9,%20empty%20space%20on%20the%20left%20for%20website%20text,%20no%20pills,%20no%20medicine,%20no%20people';
const ShopHome: React.FC = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        <section className="relative overflow-hidden min-h-[32rem] bg-linear-to-br from-rose-800 to-pink-700 text-white py-10">          {/* Hero section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ShopBreadcrumbs items={[{ label: 'Shop', href: '/shop' }]} />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={shopHeroImageUrl}
            alt="Medical aid kit beside a wheelchair"
              className="h-full w-full object-cover object-[center_70%] opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/75 via-rose-900/55 to-pink-700/30" />
        </div>
        <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6 lg:top-8 lg:right-8 hidden">
          <ShopOverlayMenu />
        </div>
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
                onChange={e => setQ(e.target.value)} 
                placeholder="Search products..."
                className="text-gray-500 px-3 py-2 text-sm w-44 sm:w-64 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-2 text-gray-500 text-sm">
                <Search className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      </section>
<BenefitsMarquee />  
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Browse products</p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">Loading products...</p>
              </div>
            )}
            {error && (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {!loading && products.length === 0 && !error && (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No products available</p>
              </div>
            )}
            {products.map((product) => {
              const inWishlist = wishlist.includes(product.id);

              return (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  href={`/shop/products/${product.handle}`}
                  showWishlist
                  inWishlist={inWishlist}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  actionLabel="Add"
                  onAction={(e) => quickAdd(product, e)}
                />
              );
            })}
          </div>
        </div>
      </section>                                                                                                {/* Marquee of trust badges */}
    </SiteLayout>
  );
};

export default ShopHome;