"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, ArrowLeft, Check, Truck, Shield } from 'lucide-react';
import { fmt, addToCart } from '@/lib/cart';

const ProductDetail: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const nav = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!handle) return;
    supabase.from('ecom_products').select('*').eq('handle', handle).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [handle]);

  if (loading) return <SiteLayout><div className="py-20 text-center">Loading...</div></SiteLayout>;
  if (!product) return <SiteLayout><div className="py-20 text-center">Product not found. <Link href="/shop/products" className="text-rose-700">Browse all</Link></div></SiteLayout>;

  const inStock = product.inventory_qty == null || product.inventory_qty > 0;

  const add = () => {
    addToCart({ product_id: product.id, name: product.name, sku: product.sku, price: product.price, image: product.images?.[0] }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart({ product_id: product.id, name: product.name, sku: product.sku, price: product.price, image: product.images?.[0] }, qty);
    nav.push('/shop/checkout');
  };

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/shop/products" className="inline-flex items-center gap-1 text-slate-600 text-sm mb-6 hover:text-rose-700"><ArrowLeft className="w-4 h-4" /> All products</Link>
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">{product.product_type}</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
            <div className="text-3xl font-bold text-slate-900 mb-4">{fmt(product.price)}</div>
            {inStock ? (
              <div className="inline-flex items-center gap-1 text-sm text-emerald-700 font-semibold mb-5"><Check className="w-4 h-4" /> In stock</div>
            ) : (
              <div className="text-sm text-red-600 font-semibold mb-5">Out of stock</div>
            )}
            <p className="text-slate-700 mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-slate-700">−</button>
                <div className="w-10 text-center font-semibold">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-slate-700">+</button>
              </div>
              <button onClick={add} disabled={!inStock} className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <ShoppingCart className="w-4 h-4" /> {added ? 'Added!' : 'Add to cart'}
              </button>
            </div>
            <button onClick={buyNow} disabled={!inStock} className="w-full py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-lg font-semibold disabled:opacity-50">Buy it now</button>

            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2 items-center text-slate-700"><Truck className="w-4 h-4 text-rose-600" /> Free UK delivery</div>
              <div className="flex gap-2 items-center text-slate-700"><Shield className="w-4 h-4 text-rose-600" /> Secure payment</div>
              <div className="text-slate-500">SKU: {product.sku}</div>
              {product.inventory_qty != null && <div className="text-slate-500">{product.inventory_qty} available</div>}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ProductDetail;