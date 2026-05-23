"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShoppingCart, X, ArrowUpRight } from 'lucide-react';
import { COMPANY } from '@/lib/constants';

type CartItem = {
  quantity?: number;
};

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

// overlay clip-path will be animated inline on the top-level motion.div

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

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('ecom_cart') || '[]') as CartItem[];
        setCartCount(cart.reduce((s: number, i: CartItem) => s + (i.quantity || 0), 0));
      } catch { setCartCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdated', update);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const openMenu = () => setOpen(true);

  return (
    <header className="sticky top-0 z-50 bg-[rgb(42,61,130)] border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2">
            <img
              src= {COMPANY.logo}
              alt="IKOMS Logo"
              className="h-28 w-auto block"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.filter((item) => item.to !== '/').slice(0, 4).map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`
                            px-4 py-2 
                            rounded-md 
                            text-sm font-medium 
                            transition 
                            ${
                              pathname.startsWith(item.to)
                              ? 'text-white bg-white/15'
                              : 'text-gray-200 hover:text-white hover:bg-white/10'
                            }
                         `}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/about" 
                  className="
                              px-4 py-2 
                              rounded-md 
                              text-sm font-medium 
                              text-gray-200 
                              hover:text-white hover:bg-white/10
                            "
              >
                About
            </Link>
            <Link href="/contact" 
                  className="
                              px-4 py-2 
                              rounded-md 
                              text-sm font-medium 
                              text-gray-200 
                              hover:text-white hover:bg-white/10
                            "
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/shop/cart" className="relative p-2 text-gray-200 hover:text-white rounded-md hover:bg-white/10 transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin"
              className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition"
            >
              Admin
            </Link>
            <button
              ref={triggerRef}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              onClick={() => (open ? closeMenu() : openMenu())}
              aria-expanded={open}
              aria-controls="site-menu-overlay"
              aria-label={open ? 'Close menu' : 'Open menu'}
              type="button"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <motion.span
                  className="absolute block h-0.5 w-5 rounded-full bg-current"
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="absolute block h-0.5 w-5 rounded-full bg-current"
                  animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 1, 1] }}
                />
                <motion.span
                  className="absolute block h-0.5 w-5 rounded-full bg-current"
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
              <span className="hidden sm:inline">{open ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu-overlay"
            className="fixed inset-0 z-[70]"
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
              onClick={() => closeMenu()}
            />

            <motion.div
              className="relative flex h-full w-full flex-col bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] text-white"
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
                    onClick={() => closeMenu()}
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
    </header>
  );
};

export default Header;
