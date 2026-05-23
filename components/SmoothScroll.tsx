"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';

    const lenis = new Lenis({
      duration: 1.8,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Trigger a smooth scroll-to-top on navigation (pathname or search params changes)
    lenisRef.current?.scrollTo(0, { duration: 1.8, immediate: false });
  }, [pathname, searchParams?.toString()]);

  return null;
}