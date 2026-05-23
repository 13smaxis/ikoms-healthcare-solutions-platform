"use client";

import Lenis from "lenis";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';

    const lenis = new Lenis({
      duration: 1.6,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const frameId = requestAnimationFrame(raf);

    lenis.scrollTo(0, { duration: 1.4, immediate: false });

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      window.history.scrollRestoration = 'auto';
    };
  }, [pathname]);

  return null;
}