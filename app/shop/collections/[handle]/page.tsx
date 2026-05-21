"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { fmt, addToCart } from '@/lib/cart';

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

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Shop · Collection</div>
          <h1 className="text-3xl lg:text-4xl font-bold">{col?.title || handle}</h1>
          {col?.description && <p className="text-pink-100 mt-2">{col.description}</p>}
        </div>
      </section>
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : products.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No products in this collection yet. <Link href="/shop/products" className="text-rose-700">Browse all</Link></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => (
                <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                  <div className="aspect-square bg-slate-100"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
                  <div className="p-4">
                    <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold">{fmt(p.price)}</div>
                      <button onClick={(e) => quickAdd(p, e)} className="text-xs font-semibold px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md">Add</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default CollectionPage;