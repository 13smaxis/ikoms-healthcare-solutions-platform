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
import { getProductsForCollectionHandle, getProductImage } from '@/lib/category-products';
import { useWishlist } from '@/contexts/WishlistContext';
import { addToCart, fmt } from '@/lib/cart';
import ShopProductCard from '@/components/ShopProductCard';

const CollectionPage: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;                             //-Extracts the handle from URL parameters
  const { wishlist, toggleWishlist } = useWishlist();                                                           //-Accesses the wishlist logic from WishlistContext
  const category = getCategoryByHandle(handle || '');                                                           //-Find category details based on handle from URL, if not found, category will be undefined
  const collectionTitle = category?.title || 'Collection';                                                      //-Try to find catergory name, if not found, fallback and use 'collection'
  const collectionDescription = 'Browse hot buys, highlights and products in this collection.';
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
      >                                                                                                         {/* Hero-header section for breadcrums and menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap py-4">
            <ShopBreadcrumbs
              variant="hero"
              items={[
                { label: 'Home', href: '/shop' },
                { label: collectionTitle },
              ]}
            />
            <div className="hidden">
              <ShopOverlayMenu className="hidden xl:flex" />
            </div>
          </div>
        </div>
      </section>

      <div className="xl:hidden">                                                                               {/* Mobile category menu button and sliding menu */}
        <button
          type="button"
          aria-expanded={showMobileCategories}
          onClick={() => setShowMobileCategories((prev) => !prev)}
          onPointerDown={handleCategoryHandlePointerDown}
          onPointerUp={handleCategoryHandlePointerUp}
          className={`
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
                      transition-transform duration-300
                      ${showMobileCategories ? '-translate-x-72' : 'translate-x-0'}
                    `}
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
                      fixed top-36 bottom-4 right-0 z-30
                      w-72
                      overflow-y-auto
                      bg-gray-300
                      rounded-l-3xl
                      px-6 py-8
                      shadow-2xl
                      transition-transform
                      duration-300
                      ${showMobileCategories ? 'translate-x-0' : 'translate-x-full'}
                    `}
        >                                                                                                       {/* Mobile category menu container with content/links */}
          {/*<div className="relative">                                                                         {/* Container for the close button, positioned at the top of the menu
            <button
              type="button"
              onClick={closeMobileCategories}
              className="
                          absolute 
                          top-0 left-0 
                          flex 
                          h-11 w-11 
                          -translate-y-1/2 translate-x-0
                          items-center justify-center 
                          rounded-full 
                          bg-rose-600 
                          text-sm font-semibold text-white 
                          shadow-lg 
                          transition 
                          hover:bg-rose-700
                        "
            >
              X
            </button>
          </div> */}
          <div className="flex min-h-[calc(100%-4.5rem)] flex-col items-center justify-center gap-3 pt-16">
            {SHOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.handle}
                href={`/shop/collections/${cat.handle}`}
                onClick={closeMobileCategories}
                className="
                            w-full max-w-[18rem]
                            rounded-2xl 
                            border border-slate-200 
                            bg-slate-50 
                            px-4 py-3 
                            text-center text-sm font-medium text-slate-700 
                            transition 
                            hover:border-rose-300 hover:bg-rose-30
                          "
              >                                                                                                 {/* Maps through the list of categories and creates a link for each one, clicking a category will also close the mobile menu */}
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
            className="fixed inset-0 z-10 bg-slate-900/30 backdrop-blur-xs"
          />
        ) : null}
      </div>

      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-16 sm:py-20">          {/* Hero-content section - Collection title and description */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {collectionTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-pink-100 sm:text-base">                       {/* Collection name and description */}
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
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">
                      Shop the collection
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      Trending products in {collectionTitle}
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                    {products.length} products available now
                </p>                                                                                            {/* Counts and Displays the number of products in the collection */}
              </div>                                                                                            {/* Header section for the product grid, includes a title and product count */}

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
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
                      onAction={() => {
                        addToCart(
                          {
                            product_id: product.id,
                            name: product.name,
                            sku: product.sku,
                            price: product.price,
                            image: getProductImage(product),
                          },
                          1,
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
                No products in this collection yet.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default CollectionPage;
