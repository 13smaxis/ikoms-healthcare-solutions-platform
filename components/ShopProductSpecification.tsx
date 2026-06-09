/*
 * Shop Product Specification Component - components/ShopProductSpecification.tsx
 * Builds 
 */

'use client';

import { useState, useRef, type PointerEvent } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { addToCart, fmt } from '@/lib/cart';
import { getProductImage } from '@/lib/catergory-products';
import { ShopCategory } from '@/lib/category-names';
import type { ShopProduct } from '@/lib/catergory-products';

interface ShopProductSpecificationProps {
  product: ShopProduct;
  category: ShopCategory | undefined;
  categories: ShopCategory[];
  relatedProducts: ShopProduct[];
}

export default function ShopProductSpecification({ product, category, categories, relatedProducts }: ShopProductSpecificationProps) 
{
  const { wishlist, toggleWishlist } = useWishlist();                                                           //-Allows users to add or remove products from their wishlist and updates the UI accordingly.
  const inWishlist = wishlist.includes(product.id);                                                             //-Checks if the current product is in the user's wishlist to determine the state of the wishlist button.
  const isOutOfStock = !product.inventory_qty || product.inventory_qty <= 0;                                    //-Checks stock availability of the product to disable add to cart

  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const handleCategoryHandlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartX.current = event.clientX;
  };

  const handleCategoryHandlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartX.current === null) return;
    if (event.clientX - dragStartX.current > 20) {
      setShowMobileCategories(true);
    }
    dragStartX.current = null;
  };

  const closeMobileCategories = () => setShowMobileCategories(false);

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="xl:hidden">
            <button
              type="button"
              aria-expanded={showMobileCategories}
              onClick={() => setShowMobileCategories((prev) => !prev)}
              onPointerDown={handleCategoryHandlePointerDown}
              onPointerUp={handleCategoryHandlePointerUp}
              className="fixed top-1/2 left-0 z-20 -ml-8 flex h-28 w-10 items-center justify-center rounded-r-full bg-slate-950 px-1 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg"
            >
              <span className="flex flex-col items-center leading-none">
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
              className={`fixed inset-y-0 left-0 z-10 w-72 overflow-y-auto border-r border-slate-200 bg-white p-6 shadow-2xl transition-transform duration-300 ${showMobileCategories ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Categories</p>
                <button type="button" onClick={closeMobileCategories} className="text-sm font-semibold text-slate-500">
                  Close
                </button>
              </div>
              <div className="space-y-3">
                {categories.map((cat) => (
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

          <aside className="hidden xl:block sticky top-24 self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* This sidebar displays the product categories and allows users to navigate to different sections of the shop.*/}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Categories</p>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat.handle}
                  href={`/shop/collections/${cat.handle}`}
                  className="
                              block rounded-2xl 
                              border border-slate-200 
                              bg-slate-50 
                              px-4 py-3 
                              text-sm font-medium text-slate-700 
                              transition 
                              hover:border-rose-300 hover:bg-rose-300
                            "
                >                                                                                               {/*Provides nav links to different catergoriesin the shop*/}
                  {cat.title}
                </Link>
              ))}
            </div>
          </aside>

          <main className="space-y-10">
            <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start rounded-4xl bg-white p-6 shadow-sm sm:p-10">
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Product specifications</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{product.name}</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    {product.description}
                  </p>
                  {category ? (
                    <p className="mt-4 text-sm text-slate-500">Category: {category.title}</p>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(
                          {
                            product_id: product.id,
                            name: product.name,
                            sku: product.sku,
                            price: product.price,
                            image: getProductImage(product),
                          },
                          1,
                        )
                      }
                      disabled={isOutOfStock}
                      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                        isOutOfStock
                          ? 'cursor-not-allowed bg-slate-300'
                          : 'bg-rose-700 hover:bg-rose-800'
                      }`}
                    >
                      {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                        inWishlist
                          ? 'border-rose-700 bg-rose-100 text-rose-700'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
                      {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Price</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{fmt(product.price)}</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">SKU</p>
                    <p className="mt-3 text-sm text-slate-600">{product.sku}</p>
                  </div>
                </div>

                <div className="grid gap-4 text-sm leading-7 text-slate-600 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Key features</p>
                    {product.key_features?.length ? (
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                        {product.key_features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-slate-600">No key features available.</p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Medical information</p>
                    <p className="mt-3 text-slate-600">{product.medical_information || 'Medical information is not available for this product.'}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-4xl bg-slate-100 p-6 flex items-center justify-center">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-full w-full max-h-105 object-contain"
                />
              </div>
            </section>

            <section className="grid gap-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Related products</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">You may also like</h2>
                </div>
                <p className="text-sm text-slate-500">{relatedProducts.length} items</p>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {relatedProducts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/shop/products/${related.handle}`}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative overflow-hidden bg-slate-100 aspect-5/4">
                      <img
                        src={getProductImage(related)}
                        alt={related.name}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{related.product_type}</p>
                      <h3 className="mt-3 text-base font-semibold text-slate-900">{related.name}</h3>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                        <span>{fmt(related.price)}</span>
                        <span className="text-slate-500">View specs</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}
