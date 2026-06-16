"use client";

import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { ShopProduct } from '@/lib/catergory-products';
import { getProductImage } from '@/lib/catergory-products';
import { fmt } from '@/lib/cart';

type ShopProductCardProps = {
  product: ShopProduct;
  href?: string;
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  showWishlist?: boolean;
  inWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
};

const ShopProductCard = ({
  product,
  href,
  onAction,
  actionLabel = 'Add to cart',
  actionDisabled = false,
  showWishlist = false,
  inWishlist = false,
  onToggleWishlist,
  className = '',
}: ShopProductCardProps) => {
  const imageUrl = getProductImage(product);

  const content = (
    <>
      <div className="relative overflow-hidden bg-white aspect-5/4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain object-center transition duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
            No image
          </div>
        )}

        {showWishlist && onToggleWishlist ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className="
                        absolute 
                        right-3 top-3 inline-flex 
                        h-10 w-10 
                        items-center justify-center 
                        rounded-full 
                        border border-white/80 
                        bg-white/90 
                        text-slate-800 
                        shadow-sm transition 
                        hover:bg-rose-50
                      "
          >
            <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        ) : null}
      </div>

      <div className="mx-auto my-4 h-[1.5px] w-[clamp(4rem,22%,7rem)] rounded-full bg-slate-200" />

      <div className="p-4">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
              {product.product_type}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{product.name}</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-slate-900">{fmt(product.price)}</div>
            {onAction ? (
              <button
                type="button"
                disabled={actionDisabled}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!actionDisabled) {
                    onAction(event);
                  }
                }}
                className={`
                            inline-flex 
                            items-center 
                            justify-center 
                            rounded-full 
                            px-4 py-2 
                            text-sm 
                            font-semibold 
                            text-white transition 
                            ${actionDisabled ? 'cursor-not-allowed bg-slate-300' : 'bg-rose-700 hover:bg-rose-800'}`}
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  const wrapperClass = `
                          group block 
                          cursor-pointer 
                          overflow-hidden 
                          rounded-3xl 
                          border border-slate-300 
                          bg-white 
                          shadow-lg transition-shadow 
                          duration-300 ease-out 
                          hover:shadow-md 
                          ${className}
                        `;

  return href ? (
    <Link href={href} className={wrapperClass}>
      {content}
    </Link>
  ) : (
    <div className={wrapperClass}>{content}</div>
  );
};

export default ShopProductCard;
