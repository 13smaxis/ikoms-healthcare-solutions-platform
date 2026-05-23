"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const lenis = new Lenis({
      duration: 1.8,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    const resetScrollState = () => {
      lenis.scrollTo(0, { duration: 1.8, immediate: false });
    };

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    resetScrollState();
    rafId = requestAnimationFrame(raf);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        resetScrollState();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { duration: 1.8, immediate: false });
  }, [pathname, searchParamsString]);

  return null;
}