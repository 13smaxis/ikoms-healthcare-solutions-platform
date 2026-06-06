"use client";

import React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type CategoryImageCarouselProps = {
  images: string[];
  title?: string;
};

const CategoryImageCarousel: React.FC<CategoryImageCarouselProps> = ({
  images,
  title = 'Category highlights',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      axis: 'x',
      containScroll: 'trimSnaps',
      dragFree: false,
      duration: 28,
      loop: true,
    },
    []
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateState = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateState();
    emblaApi.on('select', updateState);
    emblaApi.on('reInit', updateState);

    return () => {
      emblaApi.off('select', updateState);
      emblaApi.off('reInit', updateState);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || prefersReducedMotion || images.length <= 1) return;

    const intervalId = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 3400);

    return () => window.clearInterval(intervalId);
  }, [emblaApi, prefersReducedMotion, images.length]);

  if (images.length === 0) return null;

  const getSlideState = (index: number) => {
    const total = images.length;
    const forwardDistance = (index - selectedIndex + total) % total;
    const backwardDistance = (selectedIndex - index + total) % total;
    const isActive = forwardDistance === 0;
    const isLeft = backwardDistance === 1;
    const isRight = forwardDistance === 1;

    return {
      isActive,
      isLeft,
      isRight,
      scale: isActive ? 1.06 : isLeft || isRight ? 0.88 : 0.72,
      opacity: isActive ? 1 : isLeft || isRight ? 0.8 : 0,
      rotateY: isActive ? 0 : isLeft ? 48 : isRight ? -48 : 0,
      x: isActive ? 0 : isLeft ? -56 : isRight ? 56 : 0,
      y: isActive ? 0 : isLeft || isRight ? 18 : 32,
      zIndex: isActive ? 30 : isLeft || isRight ? 20 : 1,
    };
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section
      aria-label={title}
      className="relative isolate overflow-hidden rounded-4xl bg-slate-100/95 px-4 py-8 shadow-sm ring-1 ring-slate-200 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),transparent_52%),linear-gradient(180deg,rgba(248,250,252,0.9),rgba(241,245,249,1))]" />
      <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-slate-100 to-transparent sm:w-32" />
      <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-slate-100 to-transparent sm:w-32" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-3xl italic font-semibold tracking-tight text-rose-600 sm:text-4xl">
            {title}
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl" style={{ perspective: '1800px' }}>
          <div ref={emblaRef} className="overflow-hidden px-2 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3 py-6 sm:gap-4 lg:gap-6">
              {images.map((src, idx) => {
                const state = getSlideState(idx);

                return (
                  <div
                    key={`${src}-${idx}`}
                    className="min-w-0 shrink-0 basis-[82%] sm:basis-[60%] md:basis-[42%] lg:basis-[33.333%] xl:basis-[30%]"
                  >
                    <motion.div
                      animate={{
                        opacity: state.opacity,
                        rotateY: state.rotateY,
                        scale: state.scale,
                        x: state.x,
                        y: state.y,
                      }}
                      className="relative h-72 origin-center overflow-visible sm:h-88 lg:h-104"
                      style={{
                        zIndex: state.zIndex,
                        transformStyle: 'preserve-3d',
                        transformPerspective: 1800,
                      }}
                      transition={{
                        damping: 22,
                        mass: 0.8,
                        stiffness: 160,
                        type: 'spring',
                      }}
                    >
                      <div className="absolute inset-0 rounded-4xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] ring-1 ring-white/80">
                        <div className="absolute inset-0 rounded-4xl bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0))]" />
                        <div className="relative h-full w-full p-8 sm:p-10 lg:p-12">
                          <Image
                            src={src}
                            alt={`${title} image ${idx + 1}`}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 33vw"
                            className="object-contain p-8 sm:p-10 lg:p-12"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-300/80 bg-white/90 p-3 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-40 sm:flex"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Next slide"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-300/80 bg-white/90 p-3 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-40 sm:flex"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="mt-5 flex items-center justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={[
                  'h-2.5 rounded-full transition-all',
                  idx === selectedIndex
                    ? 'w-7 bg-slate-900'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryImageCarousel;
