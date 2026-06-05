"use client";

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type CategoryImageCarouselProps = {
  images: string[];
  title?: string;
};

const CategoryImageCarousel: React.FC<CategoryImageCarouselProps> = ({
  images,
  title = 'Category highlights',
}) => {
  if (images.length === 0) return null;

  return (
    <section aria-label={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">{title}</h2>
      </div>

      <Carousel
        opts={{ align: 'start', loop: images.length > 1 }}
        className="mx-8 sm:mx-10"
        aria-label={`${title} carousel`}
      >
        <CarouselContent>
          {images.map((src, idx) => (
            <CarouselItem key={`${src}-${idx}`} className="basis-[85%] sm:basis-1/2 lg:basis-1/3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image
                  src={src}
                  alt={`${title} image ${idx + 1}`}
                  width={1200}
                  height={800}
                  className="h-44 w-full object-cover sm:h-52"
                  priority={idx === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 border-slate-300 bg-white text-slate-700 hover:bg-slate-50" />
        <CarouselNext className="right-0 border-slate-300 bg-white text-slate-700 hover:bg-slate-50" />
      </Carousel>
    </section>
  );
};

export default CategoryImageCarousel;
