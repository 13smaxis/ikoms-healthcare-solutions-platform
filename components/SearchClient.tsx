"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fmt, addToCart } from '@/lib/cart';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getProductImage, searchProducts } from '@/lib/catergory-products';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams?.get('q') ?? '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep input in sync if query param changes
    const param = searchParams?.get('q') ?? '';
    if (param !== q) setQ(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) { setResults([]); return; }
      setLoading(true);
      (async () => {
        try {
          setResults(await searchProducts(q, 50));
        } catch (err) {
          // ignore search errors
        } finally {
          setLoading(false);
        }
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  const quickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, image: getProductImage(p) }, 1);
  };

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="q" 
                   value={q} 
                   onChange={e => setQ(e.target.value)} 
                   placeholder="Search products..." 
                   className="w-full pl-9 pr-3 py-2.5 border border-slate-400 rounded-lg text-sm" 
            />
          </div>
          
        {loading ? (
          <div className="text-center py-12 text-slate-500">Searching...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map(p => (
              <Link key={p.id} href={`/shop/products/${p.handle}`} 
                               className="
                                          block 
                                          bg-white 
                                          border border-slate-200 
                                          rounded-xl 
                                          overflow-hidden hover:shadow-md 
                                          transition 
                                          group
                                        "
              >
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {getProductImage(p) ? (
                    <img
                      src={getProductImage(p)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">{p.product_type}</div>
                  <div className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">{p.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{fmt(p.price)}</div>
                    <button onClick={(e) => quickAdd(p, e)} 
                            className="
                                        text-xs 
                                        font-semibold 
                                        px-2.5 py-1.5 
                                        bg-rose-700 
                                        hover:bg-rose-800 
                                        text-white 
                                        rounded-md
                                      "
                    >
                        Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : q ? (
          <div className="
                          rounded-xl 
                          border border-slate-200 
                          bg-white 
                          p-8 
                          text-center text-slate-500
                        "
          >
              No products found for &ldquo;{q}&rdquo;.
          </div>
        ) : null}
      </div>
    </section>
  );
}
