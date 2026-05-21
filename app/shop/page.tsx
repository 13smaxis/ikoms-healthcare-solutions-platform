"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react';
import { fmt, addToCart } from '@/lib/cart';

const ShopHome: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active').contains('tags', ['featured']).limit(8)
      .then(({ data }) => setFeatured(data || []));
    supabase.from('ecom_collections').select('*').eq('is_visible', true).limit(4)
      .then(({ data }) => setCollections(data || []));
  }, []);

  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: p.images?.[0] }, 1);
  };

  return (
    <SiteLayout>
      <section className="relative bg-linear-to-br from-rose-800 to-pink-700 text-white py-20">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">Clinical supplies, delivered fast</h1>
          <p className="text-lg text-pink-100 max-w-2xl mb-8">PPE, equipment, uniforms, books and digital toolkits — everything healthcare teams need, in one store.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop/products" className="px-6 py-3 bg-white text-rose-800 rounded-lg font-semibold inline-flex items-center gap-2">Shop all <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/shop/cart" className="px-6 py-3 bg-emerald-600 rounded-lg font-semibold">View cart</Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-700"><Truck className="w-5 h-5 text-rose-600" /> Free UK delivery on all orders</div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-700"><Shield className="w-5 h-5 text-rose-600" /> CE-marked & clinically approved</div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-700"><ShoppingBag className="w-5 h-5 text-rose-600" /> NHS framework suppliers</div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Shop by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collections.map(c => (
              <Link key={c.id} href={`/shop/collections/${c.handle}`} className="group relative overflow-hidden rounded-xl bg-linear-to-br from-slate-100 to-slate-200 aspect-4/3 flex items-end p-5 hover:shadow-lg transition">
                <div className="relative z-10 text-slate-900">
                  <div className="font-bold text-lg">{c.title}</div>
                  <div className="text-sm text-slate-600 inline-flex items-center gap-1 group-hover:text-rose-700">Shop now <ArrowRight className="w-4 h-4" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Featured products</h2>
            <Link href="/shop/products" className="text-sm font-semibold text-rose-700">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(p => (
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
        </div>
      </section>
    </SiteLayout>
  );
};

export default ShopHome;