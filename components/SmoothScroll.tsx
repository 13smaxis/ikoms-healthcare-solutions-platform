"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();

  const clearBodyLock = () => {
    const body = document.body;
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
  };

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
      // If the site overlay menu is open, avoid calling Lenis.raf so nested scrollable containers
      // (like the overlay menu) can receive native wheel events. Lenis will resume when overlay
      // is removed because the RAF loop continues and the condition will be false.
      if (!document.getElementById('site-menu-overlay')) {
        lenis.raf(time);
      }
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
    clearBodyLock();
    lenisRef.current?.scrollTo(0, { duration: 1.8, immediate: false });
  }, [pathname, searchParamsString]);

  return null;
}