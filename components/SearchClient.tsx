"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteLayout from '@/components/layout/SiteLayout';
import { fmt, addToCart } from '@/lib/cart';
import { Search } from 'lucide-react';

export default function SearchClient() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) { setResults([]); return; }
      setLoading(true);
      supabase
        .from('ecom_products')
        .select('*')
        .ilike('name', `%${q}%`)
        .eq('status', 'active')
        .limit(50)
        .then(({ data }) => { setResults(data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: p.images?.[0] }, 1);
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>

        {loading ? <div className="text-center py-12 text-slate-500">Searching...</div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map(p => (
              <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">{p.product_type}</div>
                  <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{fmt(p.price)}</div>
                    <button onClick={(e) => quickAdd(p, e)} className="text-xs font-semibold px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md">Add</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
