"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import ShopProductSpecification from '@/components/ShopProductSpecification';
import { SHOP_CATEGORIES } from '@/lib/category-names';
import { getProducts, type ShopProduct } from '@/lib/category-products';

const ProductDetailPage: React.FC = () => {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading product detail:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const product = useMemo(
    () => products.find((item) => item.handle === handle),
    [products, handle],
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const sameType = products.filter(
      (item) => item.id !== product.id && item.product_type === product.product_type,
    );

    if (sameType.length > 0) {
      return sameType.slice(0, 3);
    }

    return products.filter((item) => item.id !== product.id).slice(0, 3);
  }, [product, products]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
            <p className="text-slate-600">Loading product details...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !product) {
    return (
      <SiteLayout>
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Product not found</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">We couldn&apos;t find that product.</h1>
            <p className="mt-4 text-slate-600">The item may have moved or is no longer available.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              Back to shop
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <ShopProductSpecification
        product={product}
        category={undefined}
        categories={SHOP_CATEGORIES}
        relatedProducts={relatedProducts}
      />
    </SiteLayout>
  );
};

export default ProductDetailPage;