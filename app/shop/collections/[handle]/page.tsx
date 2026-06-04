
/*
 * CollectionPage.tsx
 * This component renders a dynamic shop collection page based on the URL handle.
 * It determines whether the collection exists in the local SHOP_MENU or in the Supabase database,
 *  then fetches the appropriate products either from a local catalog or from the database.
 * It displays the collection header (title, description, breadcrumbs, and category intro)
 *  and renders a responsive grid of product cards with image, price, availability, wishlist, and add-to-cart functionality.
 * It also integrates cart management, wishlist state, and image resolution logic to ensure consistent product display across the shop.
 */

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { fmt, addToCart } from '@/lib/cart';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart } from 'lucide-react';
import { getCategoryByHandle } from '@/lib/categories';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';
import ShopCategoryIntro from '@/components/ShopCategoryIntro';
import ShopImageMarquee from '@/components/MenuImageMarquee';
import ShopOverlayMenu from '@/components/ShopOverlayMenu';
import { getCategoryMarqueeImages } from '@/lib/category-marquee';
import { getProducts, getProductImage } from '@/lib/products';
// ShopCategoryIntro removed to avoid duplicate intros

/*
 * Fetches the collection based on the handle from the URL, displays its title and description, and lists the products in that collection.
 * If the handle matches one of the predefined shop menu categories, it shows the corresponding products from the local catalog instead of fetching from the DB.
 */
const CollectionPage: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const [col, setCol] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!handle) return;
      setLoading(true);
      const category = getCategoryByHandle(handle);
      if (!category) { setLoading(false); return; }
      setCol({ title: category.title, description: '' });
      setProducts(await getProducts({ collectionHandle: handle }));
      setLoading(false);
    };
    run();
  }, [handle]);

  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: getProductImage(p) }, 1);
  };

  const availabilityLabel = (product: any) => {
    if (product.inventory_qty == null) return 'In stock';
    return product.inventory_qty > 0 ? `${product.inventory_qty} available` : 'Out of stock';
  };

  const availabilityClass = (product: any) => {
    if (product.inventory_qty == null || product.inventory_qty > 0) return 'bg-emerald-100 text-emerald-700';
    return 'bg-rose-100 text-rose-700';
  };

  const collectionTitle = col?.title || getCategoryByHandle(handle || '')?.title || 'Collection';
  const collectionDescription = col?.description || 'Browse hot buys, highlights, and products in this collection.';
  const marqueeImages = getCategoryMarqueeImages(handle || '');

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
              <ShopImageMarquee images={marqueeImages} />                                                       {/* Displays a marquee of category-specific images */}
            </div>
          ) : null}

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No products in this collection yet. <Link href="/shop/products" className="text-rose-700">Browse all</Link></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
              {products.map((p) => {
                const pid = String(p.id);
                return (
                  <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                    <div className="aspect-square bg-slate-100"><img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
                    <div className="p-4">
                      <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold mb-3 ${availabilityClass(p)}`}>
                        {availabilityLabel(p)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold">{fmt(p.price)}</div>
                        <div className="flex items-center gap-2">
                          <WishlistHeart productId={pid} />
                          <button
                            onClick={(e) => quickAdd(p, e)}
                            disabled={p.inventory_qty === 0}
                            className="text-xs font-semibold px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default CollectionPage;

function WishlistHeart({ productId }: { productId: string }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const active = wishlist.includes(productId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }}
      aria-pressed={active}
      className={`p-2 rounded-full border ${active ? 'bg-rose-700 text-white border-rose-700' : 'bg-white/5 text-white border-white/10'}`}
    >
      <Heart className="w-4 h-4" />
    </button>
  );
}