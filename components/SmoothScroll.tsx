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

  const scrollToTop = () => {
    clearBodyLock();
    if (lenisRef.current) {
      try {
        lenisRef.current.resize();
        lenisRef.current.scrollTo(0, { immediate: true });
      } catch (e) {
        // ignore errors during scroll reset
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    function createLenis() {
      const instance = new Lenis({
        duration: 1.8,
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = instance;
      try {
        instance.scrollTo(0, { immediate: true });
      } catch (e) {
        // ignore errors during initialization
      }
    }

    createLenis();

    let rafId = 0;

    function raf(time: number) {
      // Call Lenis.raf only when an instance exists and the overlay is not present.
      // When the overlay exists we destroy the Lenis instance so native wheel events
      // can reach overlay's internal scrollable container without being prevented.
      if (!document.getElementById('site-menu-overlay')) {
        lenisRef.current?.raf(time);
      }
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    const onPageShow = () => {
      scrollToTop();
    };

    window.addEventListener("pageshow", onPageShow);

    // Observe DOM changes to detect when the overlay is added/removed.
    const observer = new MutationObserver(() => {
      const overlayPresent = Boolean(document.getElementById('site-menu-overlay'));
      if (overlayPresent && lenisRef.current) {
        // destroy lenis so it stops intercepting wheel events
        try { lenisRef.current.destroy(); } catch (e) { /* ignore */ }
        lenisRef.current = null;
      } else if (!overlayPresent && !lenisRef.current) {
        // recreate lenis when overlay removed
        createLenis();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      cancelAnimationFrame(rafId);
      try { lenisRef.current?.destroy(); } catch (e) { /* ignore */ }
      lenisRef.current = null;
      observer.disconnect();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    scrollToTop();
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname, searchParamsString]);

  return null;
}