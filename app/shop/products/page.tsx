"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';
import { fmt, addToCart } from '@/lib/cart';

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('new');

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tp = params.get('type');
    if (tp) setType(tp);
  }, []);

  const types = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.product_type).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    let arr = products.filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (type === 'all' || p.product_type === type));
    if (sort === 'price-asc') arr = [...arr].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr = [...arr].sort((a, b) => b.price - a.price);
    else if (sort === 'name') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products, q, type, sort]);

  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: p.images?.[0] }, 1);
  };

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Shop · All products</div>
          <h1 className="text-3xl lg:text-4xl font-bold">All products</h1>
          <p className="text-pink-100 mt-2">{products.length} items · Free UK delivery on all orders</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All categories' : t}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              <option value="new">Newest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="name">Name: A → Z</option>
            </select>
          </div>

          {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(p => (
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
    </SiteLayout>
  );
};

export default ProductsList;