import React from 'react';
import type { ProductWithImages } from '@/lib/supabase-products';

type ProductImageProps = {
  product: ProductWithImages | { product_images?: Array<{ imageurl: string; alttext?: string | null }> };
  alt?: string;
  className?: string;
};

export default function ProductImage({ product, alt = 'Product image', className = '' }: ProductImageProps) {
  const image = product.product_images?.[0];
  const imageUrl = image?.imageurl;
  const imageAlt = image?.alttext || alt;

  if (!imageUrl) {
    return (
      <div className={`flex h-48 w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-900 text-sm text-slate-400 ${className}`}>
        No image available
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={imageAlt}
      loading="lazy"
      className={`h-48 w-full rounded-xl object-cover ${className}`}
    />
  );
}
