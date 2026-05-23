"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';

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
  const scrollYRef = useRef(0);
  const bodyLockRef = useRef<{
    overflow: string;
    position: string;
    top: string;
    width: string;
  } | null>(null);

  const restoreBodyScroll = () => {
    const body = document.body;
    const lock = bodyLockRef.current;

    if (!lock) {
      return;
    }

    body.style.overflow = lock.overflow;
    body.style.position = lock.position;
    body.style.top = lock.top;
    body.style.width = lock.width;
    bodyLockRef.current = null;
    window.scrollTo(0, scrollYRef.current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const body = document.body;
      scrollYRef.current = window.scrollY;
      bodyLockRef.current = {
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
      };
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollYRef.current}px`;
      body.style.width = '100%';
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
              className="relative flex h-full w-full flex-col bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] text-white"
            >
              <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                <motion.div
                  className="flex items-center justify-between gap-4"
                  variants={overlayItemVariants}
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Menu</div>
                    <div className="mt-1 text-sm text-white/60">Navigate the platform with a single gesture.</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    Close <X className="h-4 w-4" />
                  </button>
                </motion.div>

                <div className="flex flex-1 items-center py-8 sm:py-10">
                  <nav className="w-full">
                    <ul className="grid gap-3 sm:gap-4">
                      {navigationItems.map((item) => {
                        const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);

                        return (
                          <motion.li key={item.to} variants={overlayItemVariants}>
                            <Link
                              href={item.to}
                              onClick={() => setOpen(false)}
                              className={`group flex items-center justify-between gap-4 rounded-3xl border px-5 py-4 sm:px-7 sm:py-5 transition duration-300 ${
                                isActive
                                  ? 'border-white/25 bg-white/12 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                                  {item.label}
                                </span>
                                <span className="mt-2 block text-xs uppercase tracking-[0.32em] text-white/45 group-hover:text-white/65">
                                  {item.eyebrow}
                                </span>
                              </span>
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/70 transition group-hover:border-white/25 group-hover:bg-white/15 group-hover:text-white">
                                <ArrowUpRight className="h-5 w-5" />
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
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
