"use client";

import React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
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
      containScroll: false,
      dragFree: true,
      loop: true,
    },
    prefersReducedMotion
      ? []
      : [
          AutoScroll({
            direction: 'forward',
            playOnInit: true,
            speed: 1.15,
            startDelay: 0,
            stopOnFocusIn: false,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
          }),
        ]
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);

    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi]);

  if (images.length === 0) return null;

  const getSlideState = (index: number) => {
    const total = images.length;
    const distance = Math.min(
      Math.abs(index - selectedIndex),
      total - Math.abs(index - selectedIndex)
    );
    const isActive = distance === 0;
    const isAdjacent = distance === 1;

    return {
      isActive,
      isAdjacent,
      scale: isActive ? 1 : isAdjacent ? 0.9 : 0.8,
      opacity: isActive ? 1 : isAdjacent ? 0.74 : 0.45,
      rotateY: isActive ? 0 : index < selectedIndex ? 18 : -18,
      y: isActive ? 0 : isAdjacent ? 12 : 22,
      zIndex: isActive ? 20 : isAdjacent ? 10 : 1,
    };
  };

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

        <div className="relative" style={{ perspective: '1800px' }}>
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex items-center gap-4 py-4 sm:gap-6 lg:gap-8">
              {images.map((src, idx) => {
                const state = getSlideState(idx);

                return (
                  <div
                    key={`${src}-${idx}`}
                    className="min-w-0 shrink-0 basis-[78%] sm:basis-[60%] md:basis-[48%] lg:basis-[38%] xl:basis-[32%]"
                  >
                    <motion.div
                      animate={{
                        opacity: state.opacity,
                        rotateY: state.rotateY,
                        scale: state.scale,
                        y: state.y,
                      }}
                      className="relative h-72 origin-center overflow-visible sm:h-88 lg:h-104"
                      style={{
                        zIndex: state.zIndex,
                        transformStyle: 'preserve-3d',
                      }}
                      transition={{
                        damping: 22,
                        mass: 0.7,
                        stiffness: 140,
                        type: 'spring',
                      }}
                    >
                      <div className="absolute inset-0 rounded-[1.75rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] ring-1 ring-white/80">
                        <div className="absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0))]" />
                        <div className="relative h-full w-full p-8 sm:p-10 lg:p-12">
                          <Image
                            src={src}
                            alt={`${title} image ${idx + 1}`}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 48vw, 32vw"
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
        </div>
      </div>
    </section>
  );
};

export default CategoryImageCarousel;
