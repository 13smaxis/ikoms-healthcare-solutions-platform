"use client";

import React, { useMemo, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { SHOP_CATEGORIES, getCategoryByHandle } from '@/lib/category-names';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';
import LogoMarquee from '@/components/LogoMarquee';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import SearchClient from '@/components/SearchClient';
import { getCategoryMarqueeImages } from '@/lib/category-marquee';
import { getProductsForCollectionHandle, getProductImage } from '@/lib/catergory-products';
import { useWishlist } from '@/contexts/WishlistContext';
import { addToCart, fmt } from '@/lib/cart';
import { Heart } from 'lucide-react';

const CollectionPage: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;                             //-Extracts the handle from URL parameters
  const { wishlist, toggleWishlist } = useWishlist();                                                           //-Accesses the wishlist logic from WishlistContext
  const category = getCategoryByHandle(handle || '');                                                           //-Find category details based on handle from URL, if not found, category will be undefined
  const collectionTitle = category?.title || 'Collection';                                                      //-Try to find catergory name, if not found, fallback and use 'collection'
  const collectionDescription = 'Browse hot buys, highlights, and products in this collection.';
  const marqueeImages = getCategoryMarqueeImages(handle || '');                                                 //-Get marquee images for the category, if not found, will return an empty array
  const products = useMemo(
    () => getProductsForCollectionHandle(handle || ''),
    [handle],
  );

  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const handleCategoryHandlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartX.current = event.clientX;
  };

  const handleCategoryHandlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartX.current === null) return;
    if (dragStartX.current - event.clientX > 20) {
      setShowMobileCategories(true);
    }
    dragStartX.current = null;
  };

  const closeMobileCategories = () => setShowMobileCategories(false);

  const hasProducts = products.length > 0;                                                                      //-Determines if there are products to display in the collection

  return (
    <SiteLayout>
      <section className="
                          fixed left-0 right-0 
                          z-40 
                          border-b border-white/10 
                          bg-linear-to-br from-rose-800 to-pink-700 
                          text-white
                        "
        >                                                                                                       {/* Hero-header section for breadcrums and menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap py-4">
            <ShopBreadcrumbs
              variant="hero"
              items={[
                { label: 'Home', href: '/shop' },
                { label: collectionTitle },
              ]}
            />
            <ShopOverlayMenu className="hidden xl:flex" />                                                         {/* Keep desktop category menu visible only on larger screens */}
          </div>
        </div>
      </section>

      <div className="xl:hidden">
        <button
          type="button"
          aria-expanded={showMobileCategories}
          onClick={() => setShowMobileCategories((prev) => !prev)}
          onPointerDown={handleCategoryHandlePointerDown}
          onPointerUp={handleCategoryHandlePointerUp}
          className="
                      fixed top-1/2 right-0 z-20
                      -mr-5 flex
                      h-32 w-14
                      items-center justify-center
                      rounded-tl-3xl rounded-bl-3xl
                      bg-slate-950
                      px-2
                      text-[10px] font-semibold
                      uppercase tracking-[0.35em]
                      text-white shadow-lg
                    "
        >
          <span className="
                            flex h-full flex-col
                            pr-4
                            justify-center text-center
                            leading-none
                          "
          >
            <span>C</span>
            <span>A</span>
            <span>T</span>
            <span>E</span>
            <span>G</span>
            <span>O</span>
            <span>R</span>
            <span>Y</span>
          </span>
        </button>

        <div
          className={`
                      fixed inset-y-0 right-0 z-10
                      w-72
                      overflow-y-auto
                      border-l border-slate-200
                      bg-white
                      px-6 py-8
                      shadow-2xl
                      transition-transform
                      duration-300
                      ${showMobileCategories ? 'translate-x-0' : 'translate-x-full'}
                    `}
        >
          <div className="mb-6 flex items-center justify-between pt-24">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Categories</p>
            <button type="button" onClick={closeMobileCategories} className="text-sm font-semibold text-slate-500">
              Close
            </button>
          </div>
          <div className="space-y-3 pt-8">
            {SHOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.handle}
                href={`/shop/collections/${cat.handle}`}
                onClick={closeMobileCategories}
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-300"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        {showMobileCategories ? (
          <button
            type="button"
            aria-label="Close categories"
            onClick={closeMobileCategories}
            className="fixed inset-0 z-0 bg-slate-900/40"
          />
        ) : null}
      </div>

      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-16 sm:py-20">           {/* Hero-content section - Collection title and description */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {collectionTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-pink-100 sm:text-base">
              {collectionDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-8 sm:py-10">                                                         {/* Product grid section - includes marquee, carousel, search, and product listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {marqueeImages.length > 0 ? (
            <div className="pb-6 sm:pb-8">
              <LogoMarquee images={marqueeImages} />
            </div>
          ) : null}

          {/*{carouselImages.length > 0 ? (
            <div className="pb-6 sm:pb-8">
              <CategoryImageCarousel images={carouselImages} />
            </div>
          ) : null}*/}

          <SearchClient />                                                                                      {/* Search within the collection - can be enhanced to filter results by collection handle */}

          {hasProducts ? (
            <div className="pt-8 lg:pt-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Shop the collection</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Trending products in {collectionTitle}</h2>
                </div>
                <p className="text-sm text-slate-500">{products.length} products available now</p>            {/* Counts and Displays the number of products in the collection */}
              </div>                                                                                            {/* Header section for the product grid, includes a title and product count */}

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => {
                  const inWishlist = wishlist.includes(product.id);

                  return (
                    <Link
                      key={product.id} 
                      href={`/shop/products/${product.handle}`}
                      className="group block cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 ease-out hover:shadow-md"
                    >                                                                                           {/* On-click, link redirects to the product detail(catergory-products) */}
                      <div className="relative overflow-hidden bg-slate-100 aspect-5/4">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="
                                      w-full h-full 
                                      object-contain object-center 
                                      transition 
                                      duration-500
                                    "
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

                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{product.product_type}</p>
                            <h3 className="mt-2 text-base font-semibold text-slate-900">{product.name}</h3>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-semibold text-slate-900">{fmt(product.price)}</div>
                            <button
                              type="button"
                              disabled={!product.inventory_qty || product.inventory_qty <= 0}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (product.inventory_qty && product.inventory_qty > 0) {
                                  addToCart(
                                            { 
                                              product_id: product.id,
                                              name: product.name, 
                                              sku: product.sku, 
                                              price: product.price, 
                                              image: getProductImage(product) 
                                            }, 
                                          1);
                                }
                              }}
                              className={`
                                          inline-flex 
                                          items-center justify-center 
                                          rounded-full 
                                          px-4 py-2 
                                          text-sm 
                                          font-semibold text-white 
                                          transition 
                                          ${product.inventory_qty && product.inventory_qty > 0 ? 
                                            'bg-rose-700 hover:bg-rose-800' : 
                                            'cursor-not-allowed bg-slate-300'
                                           }
                                       `}
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
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
