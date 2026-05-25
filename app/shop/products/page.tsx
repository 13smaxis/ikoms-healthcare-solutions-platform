"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { Search, Heart } from 'lucide-react';
import { fmt, addToCart } from '@/lib/cart';
import { SHOP_CATALOG, mergeShopProducts, normalizeShopTag } from '@/lib/shop-catalog';
import { useWishlist } from '@/contexts/WishlistContext';

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('new');

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(mergeShopProducts(data || [], SHOP_CATALOG)); setLoading(false); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q');
    const tagParam = params.get('tag');
    const tp = params.get('type');
    if (search) setQ(search);
    if (tagParam) setTag(tagParam);
    if (tp) setType(tp);
  }, []);

  const types = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.product_type).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const productType = p.product_type || '';
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const qMatch = !q || name.includes(q.toLowerCase());
      const typeMatch = type === 'all' || productType === type;
      const tagMatch = !tag || tags.some((candidate: string) => normalizeShopTag(candidate) === normalizeShopTag(tag)) || normalizeShopTag(productType) === normalizeShopTag(tag);
      return qMatch && typeMatch && tagMatch;
    });
    if (sort === 'price-asc') arr = [...arr].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr = [...arr].sort((a, b) => b.price - a.price);
    else if (sort === 'name') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products, q, tag, type, sort]);

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
              <input name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
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
              {filtered.map(p => {
                const pid = String(p.id);
                return (
                  <Link key={p.id} href={`/shop/products/${p.handle}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-slate-500 mb-1">{p.product_type}</div>
                      <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold mb-3 ${availabilityClass(p)}`}>
                        {availabilityLabel(p)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">{fmt(p.price)}</div>
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
              {filtered.length === 0 && <div className="col-span-full py-12 text-center text-slate-500">No products match your filters.</div>}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default ProductsList;

function WishlistHeart({ productId }: { productId: string }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const active = wishlist.includes(productId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }}
      aria-pressed={active}
      className={`p-2 rounded-full border ${active ? 'bg-rose-700 text-white border-rose-700' : 'bg-white/10 text-slate-700 border-slate-200'}`}
    >
      <Heart className="w-4 h-4" />
    </button>
  );
}