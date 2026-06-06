"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { SHOP_CATEGORIES } from '@/lib/category-names';

type NavigationItem = {
  to: string;
  label: string;
  eyebrow: string;
};

const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Home', eyebrow: 'Start here' },
  { to: '/recruitment', label: 'Recruitment', eyebrow: 'Staffing' },
  { to: '/training', label: 'Training', eyebrow: 'Learning' },
  { to: '/consultancy', label: 'Consultancy', eyebrow: 'Advisory' },
  { to: '/shop', label: 'Shop', eyebrow: 'Supplies' },
  { to: '/about', label: 'About', eyebrow: 'Who we are' },
  { to: '/contact', label: 'Contact', eyebrow: 'Talk to us' },
];

const overlayItemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

export default function ShopOverlayMenu({ className }: { className?: string }) 
{
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);                                                        //- ref for the scrollable menu container
  const scrollYRef = useRef(0);                                                                                 //- ref to store the scrollY position before locking scroll, so we can restore it on close
  const bodyLockRef = useRef<{
    bodyOverflow: string;
    docOverflow: string;
  } | null>(null);

  const restoreBodyScroll = () => {
    const body = document.body;
    const lock = bodyLockRef.current;

    if (!lock) {
      return;
    }

    body.style.overflow = lock.bodyOverflow;
    // also restore html/documentElement overflow if we touched it
    try {
      document.documentElement.style.overflow = lock.docOverflow;
    } catch (e) {
      // ignore
    }
    bodyLockRef.current = null;
    // ensure visual scroll position is preserved for any smooth scroller
    window.scrollTo(0, scrollYRef.current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open)                                                                           //-Always allow Escape to close the menu
      {
        setOpen(false);
        return;
      }

      if (!open) return;

      
      const active = document.activeElement as HTMLElement | null;                                              //-Avoid interfering when user is typing in an input/textarea/contenteditable
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

      const el = scrollRef.current;                                                                             //-Get the scrollable menu container
      if (!el) return;                                                                                          //-If for some reason we don't have the ref, bail out

      if (e.key === 'ArrowDown')                                                                                //-Arrow and paging controls: scroll the menu container
      {
        e.preventDefault();
        el.scrollBy({ top: 80, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        el.scrollBy({ top: -80, behavior: 'smooth' });
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        el.scrollBy({ top: Math.floor(el.clientHeight * 0.9), behavior: 'smooth' });
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        el.scrollBy({ top: -Math.floor(el.clientHeight * 0.9), behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        el.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      const body = document.body;
      scrollYRef.current = window.scrollY;
      bodyLockRef.current = {
        bodyOverflow: body.style.overflow,
        docOverflow: document.documentElement.style.overflow,
      };
      // Use overflow-only lock instead of position:fixed to avoid scroll restoration races
      body.style.overflow = 'hidden';
      try { document.documentElement.style.overflow = 'hidden'; } catch (e) { /* ignore */ }
    } else {
      restoreBodyScroll();
      triggerRef.current?.focus();
    }
    return () => {
      restoreBodyScroll();
    };
  }, [open]);

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="shop-overlay"
          className={`
                        inline-flex items-center gap-2 flex-nowrap whitespace-nowrap shrink-0
                        rounded-full
                        bg-white/90
                        px-4 py-2
                        text-sm font-semibold
                        text-slate-700
                        border-0 border-none outline-none ring-0 appearance-none
                        shadow-sm
                        hover:bg-slate-100
                        ${className ?? ''}
                    `}
        >
          Shop menu
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu-overlay"
            className="fixed inset-0 z-70"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation menu"
            initial={{ clipPath: 'circle(0% at 100% 0%)', opacity: 1 }}
            animate={{
              clipPath: 'circle(150% at 100% 0%)',
              opacity: 1,
              transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1] as const,
                when: 'beforeChildren',
                staggerChildren: 0.08,
                delayChildren: 0.32,
              },
            }}
            exit={{ clipPath: 'circle(0% at 100% 0%)', opacity: 0, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] as const } }}
          >
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] text-white"
            >
              <div className="mx-auto flex h-full w-full max-w-7xl flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                <motion.div
                  className="flex items-center justify-between gap-4"
                  variants={overlayItemVariants}
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Menu</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    Close <X className="h-4 w-4" />
                  </button>
                </motion.div>

                <div ref={scrollRef} 
                     className="
                                flex-1 
                                min-h-0 
                                overflow-y-auto 
                                py-8 sm:py-10 pr-1 
                                hide-scrollbar
                              "
                >
                  <nav className="w-full">
                    <div className="grid gap-3 sm:gap-4">
                      {SHOP_CATEGORIES.map((cat) => (
                        <motion.div key={cat.handle} variants={overlayItemVariants}>
                          <Link
                            href={`/shop/collections/${cat.handle}`}
                            onClick={() => setOpen(false)}
                            className="group flex items-center justify-between gap-4 rounded-3xl border px-5 py-4 sm:px-7 sm:py-5 transition duration-300 bg-white/5 hover:bg-white/10"
                          >
                            <span className="min-w-0">
                              <span className="block text-3xl sm:text-4xl font-semibold tracking-tight">
                                {cat.title}
                              </span>
                              <span className="mt-2 block text-xs uppercase tracking-[0.32em] text-white/45">Products</span>
                            </span>
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/70 transition group-hover:border-white/25 group-hover:bg-white/15 group-hover:text-white">
                              <ArrowUpRight className="h-5 w-5" />
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </nav>
                </div>

                <motion.div
                  className="grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1.4fr_0.6fr]"
                  variants={overlayItemVariants}
                >
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-5 sm:p-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Need help fast?</div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                      Speak with the team about staffing, training, consultancy, or clinical supplies.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end sm:justify-end">
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Contact us
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                    >
                      Browse shop
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}