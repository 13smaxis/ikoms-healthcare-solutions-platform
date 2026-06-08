"use client";

import React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type CategoryImageCarouselProps = {
  images: string[];
};

const CategoryImageCarousel: React.FC<CategoryImageCarouselProps> = ({
  images,
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

  const getLabelFromSrc = (src: string) => {
    const fileName = src.split('/').pop() ?? '';
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return baseName
      .split(' ')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

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
      aria-label="Category image carousel"
      className="relative isolate overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="relative mx-auto max-w-7xl" style={{ perspective: '1800px' }}>
          <div ref={emblaRef} className="overflow-hidden px-2 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3 py-6 sm:gap-4 lg:gap-6">
              {images.map((src, idx) => {
                const state = getSlideState(idx);
                const productLabel = getLabelFromSrc(src);

                return (
                  <div
                    key={`${src}-${idx}`}
                    className="
                                min-w-0 shrink-0 
                                basis-[82%] sm:basis-[64%] md:basis-[42%] lg:basis-[22%]
                                "
                  >                                                                                             {/* The motion.div is used to apply the 3D carousel effect based on the calculated state for each slide */}
                    <motion.div
                      animate={{
                        opacity: state.opacity,
                        rotateY: state.rotateY,
                        scale: state.scale,
                        x: state.x,
                        y: state.y,
                      }}
                      className="relative h-78 origin-center overflow-visible sm:h-68"
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
                      <div className="absolute inset-0 rounded-4xl shadow-[0_30px_80px_rgba(15,23,42,0.14)] overflow-hidden">
                        <div className="relative h-full w-full">
                          <Image
                            src={src}
                            alt={`Carousel image of ${productLabel}`}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 25vw"
                            className="object-contain"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                            {productLabel}
                          </div>
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
