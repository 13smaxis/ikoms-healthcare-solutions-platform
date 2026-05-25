"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ShopImageMarquee from '@/components/ShopImageMarquee';
import { CLINICAL_SUPPLIES_CAROUSEL_IMAGES } from '@/lib/shop-catalog';

export default function ShopCategoryIntro({ handle }: { handle: string }) {
  const carouselImages = CLINICAL_SUPPLIES_CAROUSEL_IMAGES;

  const marqueeImages = [
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/iv-cannulas.jpg',
    '/images/clinical-supplies/disposable-aprons.jpg',
    '/images/clinical-supplies/catheters.jpg',
  ];

  return (
    <section className="space-y-6 py-6 sm:py-8">
      <div className="rounded-4xl bg-white p-4 sm:p-6 lg:p-8">
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {carouselImages.map((src, index) => {
              return (
                <CarouselItem key={`${src}-${index}`} className="pl-4 md:basis-1/2 xl:basis-1/3">
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