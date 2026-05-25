"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  
} from '@/components/ui/carousel';
import ShopImageMarquee from '@/components/ShopImageMarquee';
import { CLINICAL_SUPPLIES_CAROUSEL_IMAGES, SHARED_MARQUEE_IMAGES } from '@/lib/shop-catalog';
import { useEffect, useState } from 'react';

export default function ShopCategoryIntro({ handle }: { handle: string }) {
  const carouselImages = CLINICAL_SUPPLIES_CAROUSEL_IMAGES;
  const marqueeImages = SHARED_MARQUEE_IMAGES;
  const [api, setApi] = useState<any>(null);

  return (
    <section className="space-y-6 py-6 sm:py-8">
      <div className="rounded-4xl bg-white p-4 sm:p-6 lg:p-8">
        <Carousel opts={{ align: 'center', loop: true }} setApi={setApi} className="w-full">
          <CarouselContent>
            {carouselImages.map((src, index) => {
              return (
                <CarouselItem key={`${src}-${index}`}>
                  <div className="overflow-hidden rounded-3xl bg-slate-100">
                    <div className="aspect-16/10">
                      <img src={src} alt="Carousel slide" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

        </Carousel>

        {/** autoplay: continuous looping via embla api */}
        {api && (
          <AutoplayController api={api} />
        )}

        <div className="mt-6 flex justify-end">
          <Link href="/shop/products" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-800">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <ShopImageMarquee images={marqueeImages} title="Shop gallery" />
    </section>
  );
}

function AutoplayController({ api }: { api: any }) {
  useEffect(() => {
    if (!api) return;
    let raf: number | null = null;
    let mounted = true;

    const step = () => {
      if (!mounted) return;
      try {
        api.scrollNext();
      } catch (e) {
        // ignore
      }
      raf = window.setTimeout(step, 3000) as unknown as number;
    };

    raf = window.setTimeout(step, 3000) as unknown as number;

    return () => {
      mounted = false;
      if (raf) window.clearTimeout(raf as unknown as number);
    };
  }, [api]);

  return null;
}