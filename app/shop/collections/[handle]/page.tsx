"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { getCategoryByHandle } from '@/lib/category-names';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';
import LogoMarquee from '@/components/LogoMarquee';
import CategoryImageCarousel from '@/components/CategoryImageCarousel';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import { getCategoryMarqueeImages } from '@/lib/category-marquee';
import { getCategoryCarouselImages } from '@/lib/catergory-carousel';
import { getProductsForCollectionHandle, getProductImage } from '@/lib/catergory-products';
import { useWishlist } from '@/contexts/WishlistContext';
import { addToCart, fmt } from '@/lib/cart';
import { Heart } from 'lucide-react';

const CollectionPage: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const { wishlist, toggleWishlist } = useWishlist();
  const category = getCategoryByHandle(handle || '');
  const collectionTitle = category?.title || 'Collection';
  const collectionDescription = 'Browse hot buys, highlights, and products in this collection.';
  const marqueeImages = getCategoryMarqueeImages(handle || '');
  const carouselImages = getCategoryCarouselImages(handle || '');
  const products = useMemo(
    () => getProductsForCollectionHandle(handle || ''),
    [handle],
  );

  const hasProducts = products.length > 0;

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap mb-4">
            <ShopBreadcrumbs
              variant="hero"
              items={[
                { label: 'Shop', href: '/shop' },
                { label: collectionTitle },
              ]}
            />
            <ShopOverlayMenu />
          </div>
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Category</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{collectionTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-pink-100 sm:text-base">{collectionDescription}</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {marqueeImages.length > 0 ? (
            <div className="pb-6 sm:pb-8">
              <LogoMarquee images={marqueeImages} />
            </div>
          ) : null}

          {carouselImages.length > 0 ? (
            <div className="pb-6 sm:pb-8">
              <CategoryImageCarousel images={carouselImages} />
            </div>
          ) : null}

          {hasProducts ? (
            <div className="pt-8 lg:pt-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Shop the collection</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Trending products in {collectionTitle}</h2>
                </div>
                <p className="text-sm text-slate-500">{products.length} products available now</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const inWishlist = wishlist.includes(product.id);
                  const stockLabel = product.inventory_qty && product.inventory_qty > 0 ? `${product.inventory_qty} in stock` : 'Out of stock';

                  return (
                    <article key={product.id} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative overflow-hidden bg-slate-100 aspect-4/3">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain object-center transition duration-500"
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-sm transition hover:bg-rose-50"
                        >
                          <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.product_type}</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.inventory_qty && product.inventory_qty > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {stockLabel}
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <p className="text-sm leading-6 text-slate-500 line-clamp-2 group-hover:line-clamp-4 transition-all duration-200">
                            {product.description}
                          </p>
                          <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Key features</p>
                            <p className="text-sm text-slate-500">{product.tags.join(' · ')}</p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                          <div className="text-lg font-semibold text-slate-900">{fmt(product.price)}</div>
                          <button
                            type="button"
                            disabled={!product.inventory_qty || product.inventory_qty <= 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (product.inventory_qty && product.inventory_qty > 0) {
                                addToCart({ product_id: product.id, name: product.name, sku: product.sku, price: product.price, image: getProductImage(product) }, 1);
                              }
                            }}
                            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition ${product.inventory_qty && product.inventory_qty > 0 ? 'bg-rose-700 hover:bg-rose-800' : 'cursor-not-allowed bg-slate-300'}`}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">No products in this collection yet.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default CollectionPage;
