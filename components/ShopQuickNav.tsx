"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, UserCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fmt } from '@/lib/cart';

type Collection = {
  id: string;
  title: string;
  handle: string;
};

type Product = {
  id: string;
  name: string;
  handle: string;
  images?: string[];
  price: number;
  product_type?: string;
};

type CollectionMenu = {
  collection: Collection;
  products: Product[];
};

type QuickNavItem = {
  label: string;
  handle: string;
};

const quickNavItems: QuickNavItem[] = [
  { label: 'PPE & Protective Gear', handle: 'ppe-protective-gear' },
  { label: 'Equipment & Supplies', handle: 'equipment-supplies' },
  { label: 'Uniforms & Apparel', handle: 'uniforms-apparel' },
  { label: 'Learning Resources', handle: 'learning-resources' },
];

export default function ShopQuickNav() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menus, setMenus] = useState<CollectionMenu[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || '');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: collections } = await supabase
        .from('ecom_collections')
        .select('id,title,handle')
        .eq('is_visible', true)
        .limit(4);

      const collectionList = (collections || []) as Collection[];

      const menuData = await Promise.all(
        collectionList.map(async (collection) => {
          const { data: links } = await supabase
            .from('ecom_product_collections')
            .select('product_id, position')
            .eq('collection_id', collection.id)
            .order('position', { ascending: true });

          const productIds = (links || []).map((link) => link.product_id);

          let products: Product[] = [];

          if (productIds.length) {
            const { data: linkedProducts } = await supabase
              .from('ecom_products')
              .select('id,name,handle,images,price,product_type')
              .eq('status', 'active')
              .in('id', productIds);

            products = productIds
              .map((id) => linkedProducts?.find((product) => product.id === id))
              .filter(Boolean)
              .slice(0, 6) as Product[];
          }

          if (!products.length) {
            const { data: fallbackProducts } = await supabase
              .from('ecom_products')
              .select('id,name,handle,images,price,product_type')
              .eq('status', 'active')
              .limit(6);

            products = (fallbackProducts || []) as Product[];
          }

          return {
            collection,
            products,
          };
        })
      );

      if (!cancelled) {
        setMenus(menuData);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/shop/products?q=${encodeURIComponent(query.trim())}`);
  };

  const visibleMenus = quickNavItems.map((item, index) => ({
    collection: {
      id: item.handle,
      title: item.label,
      handle: item.handle,
    },
    products: menus[index]?.products || [],
  }));

  return (
    <div className="sticky top-20 z-40 mx-auto mt-8 max-w-7xl px-4 sm:top-24 sm:mt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="w-fit shrink-0 rounded-full border border-white/50 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-sm">
        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
          {visibleMenus.map(({ collection }, index) => (
            <div
              key={collection.id}
              className="group relative"
              style={{
                opacity: 1,
                transform: 'translateY(0)',
                transition: 'opacity 320ms ease, transform 320ms ease',
                transitionDelay: `${index * 120}ms`,
              }}
            >
              <Link
                href={`/shop/collections/${collection.handle}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-rose-700 hover:text-white"
              >
                {collection.title}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Link>

              <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-88 -translate-x-1/2 translate-y-2 rounded-3xl border border-slate-200/70 bg-white/95 p-3 opacity-0 shadow-2xl shadow-slate-900/10 backdrop-blur-sm transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {collection.title} products
                </div>
                <div className="grid gap-2">
                  {collection.id === quickNavItems[index]?.handle && menus[index]?.products?.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/products/${product.handle}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-rose-50"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.product_type || collection.title}</div>
                      </div>
                      <div className="text-sm font-bold text-rose-700">{fmt(product.price)}</div>
                    </Link>
                  ))}

                  {!(menus[index]?.products?.length) && (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                      Loading products...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </nav>

        <div className="flex items-center gap-3 self-start lg:self-auto lg:shrink-0">
          <Link
            href="/shop/account"
            className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-900/5 hover:text-rose-700 backdrop-blur-sm"
          >
            <UserCircle2 className="h-4 w-4" />
            Account
          </Link>

          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-48"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
