/*
 * Shop Product Specification Component - components/ShopProductSpecification.tsx
 * Builds 
 */

'use client';

import { Heart } from 'lucide-react';
import ShopProductCard from '@/components/ShopProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { addToCart, fmt } from '@/lib/cart';
import { getProductImage } from '@/lib/category-products';
import { ShopCategory } from '@/lib/category-names';
import type { ShopProduct } from '@/lib/category-products';

interface ShopProductSpecificationProps {
  product: ShopProduct;
  category: ShopCategory | undefined;
  categories: ShopCategory[];
  relatedProducts: ShopProduct[];
}

export default function ShopProductSpecification({ product, category, relatedProducts }: ShopProductSpecificationProps) {
  const { wishlist, toggleWishlist } = useWishlist();                                                           //-Allows users to add or remove products from their wishlist and updates the UI accordingly.
  const inWishlist = wishlist.includes(product.id);                                                             //-Checks if the current product is in the user's wishlist to determine the state of the wishlist button.

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <main className="space-y-10">                                                                         {/* Main content area displaying product details and related products */}
            <section className="
                                grid gap-8 
                                lg:grid-cols-[0.95fr_1.05fr] 
                                items-start 
                                rounded-4xl 
                                bg-white 
                                p-6 
                                shadow-sm sm:p-10
                              "
            >
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-600">
                      Product specifications
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                      {product.name}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    {product.description}
                  </p>
                  {category ? (
                    <p className="mt-4 text-sm text-slate-500">
                        Category: {category.title}
                    </p>
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
                      className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 transition"
                    >
                        Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`
                                  inline-flex 
                                  items-center justify-center 
                                  gap-2 
                                  rounded-full 
                                  border 
                                  px-5 py-3 
                                  text-sm font-semibold 
                                  transition 
                                  ${
                                      inWishlist
                                      ? 'border-rose-700 bg-rose-100 text-rose-700'
                                      : 'border-slate-200 bg-white text-slate-900 hover:border-rose-300 hover:bg-rose-50'
                                    }
                               `}
                    >
                      <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
                      {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">                                                     {/* Displays product price and SKU in styled boxes */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                        Price
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {fmt(product.price)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                        SKU
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                        {product.sku}
                    </p>
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
                    <p className="mt-3 text-slate-600">
                        {product.medical_information || 'Medical information is not available for this product.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-4xl bg-slate-100 p-6 flex items-center justify-center">
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-full w-full max-h-105 object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No image available</div>
                )}
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

              <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
                {relatedProducts.map((related) => {
                  const inWishlistRelated = wishlist.includes(related.id);

                  return (
                    <ShopProductCard
                      key={related.id}
                      product={related}
                      href={`/shop/products/${related.handle}`}
                      showWishlist
                      inWishlist={inWishlistRelated}
                      onToggleWishlist={() => toggleWishlist(related.id)}
                      actionLabel="Add"
                      onAction={() =>
                        addToCart(
                          {
                            product_id: related.id,
                            name: related.name,
                            sku: related.sku,
                            price: related.price,
                            image: getProductImage(related),
                          },
                          1,
                        )
                      }
                    />
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}
