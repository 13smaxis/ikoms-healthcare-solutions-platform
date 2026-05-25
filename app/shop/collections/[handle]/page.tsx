"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { fmt, addToCart } from '@/lib/cart';
import SHOP_MENU from '@/components/shop-menu-config';
import CategorySubList from '@/components/CategorySubList';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart } from 'lucide-react';
import { getProductsForCollectionHandle } from '@/lib/shop-catalog';

/*
 * This component represents a collection page. 
 * It fetches the collection based on the handle from the URL, displays its title and description, and lists the products in that collection.
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
      const menuMatch = SHOP_MENU.find(m => m.handle === handle);
      if (menuMatch) {
        setCol({ title: menuMatch.title, description: '' });
        setProducts(getProductsForCollectionHandle(handle));
        setLoading(false);
        return;
      }
      const { data: c } = await supabase.from('ecom_collections').select('*').eq('handle', handle).single();
      if (!c) { setLoading(false); return; }
      setCol(c);

      const { data: links } = await supabase.from('ecom_product_collections').select('product_id, position').eq('collection_id', c.id).order('position');
      let prods: any[] = [];
      if (links && links.length > 0) {
        const ids = links.map(l => l.product_id);
        const { data } = await supabase.from('ecom_products').select('*').in('id', ids).eq('status', 'active');
        prods = ids.map(id => data?.find(p => p.id === id)).filter(Boolean) as any[];
      }
      if (prods.length === 0) {
        const { data } = await supabase.from('ecom_products').select('*').contains('tags', [handle]).eq('status', 'active');
        prods = data || [];
      }
      setProducts(prods);
      setLoading(false);
    };
    run();
  }, [handle]);

  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: p.images?.[0] }, 1);
  };

  const availabilityLabel = (product: any) => {
    if (product.inventory_qty == null) return 'In stock';
    return product.inventory_qty > 0 ? `${product.inventory_qty} available` : 'Out of stock';
  };

  const availabilityClass = (product: any) => {
    if (product.inventory_qty == null || product.inventory_qty > 0) return 'bg-emerald-100 text-emerald-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <SiteLayout>
      {/* Collection pages: only show product grid (no hero / subcategory / featured heading) */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : SHOP_MENU.find(m => m.handle === handle) ? (
            // For menu-defined collections we also show only the product grid (no hero/sublist/featured)
            products.length === 0 ? (
              <div className="text-slate-500">No products are available yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map(p => {
                  const pid = String(p.id);
                  return (
                    <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                      <div className="aspect-square bg-slate-100"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
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
            )
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No products in this collection yet. <Link href="/shop/products" className="text-rose-700">Browse all</Link></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => {
                const pid = String(p.id);
                return (
                  <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                    <div className="aspect-square bg-slate-100"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
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