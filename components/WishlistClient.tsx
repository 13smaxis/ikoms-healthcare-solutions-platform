"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useWishlist } from '@/contexts/WishlistContext';
import { fmt, addToCart } from '@/lib/cart';
import { resolveShopProductImage } from '@/lib/shop-media';

export default function WishlistClient() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!wishlist || wishlist.length === 0) { setProducts([]); return; }
    supabase.from('ecom_products').select('*').in('id', wishlist).then(({ data }) => setProducts(data || []));
  }, [wishlist]);

  if (!wishlist || wishlist.length === 0) return (
    <div className="py-20 text-center">Your wishlist is empty. Browse <Link href="/shop">products</Link>.</div>
  );

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Your wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <Link href={`/shop/products/${p.handle}`} className="block">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img src={resolveShopProductImage(p)} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{fmt(p.price)}</div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: resolveShopProductImage(p) }, 1); }} className="text-xs font-semibold px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md">Add</button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(p.id); }} className="text-xs px-2 py-1.5 bg-gray-200 rounded-md">Remove</button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
