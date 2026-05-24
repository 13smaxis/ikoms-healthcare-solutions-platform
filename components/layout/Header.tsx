"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShoppingCart, X } from 'lucide-react';
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

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[rgb(42,61,130)] border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2 sm:gap-4">                                 {/* Logo and Navigation */ }
          <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">                                  {/* Logo */ }
            <img
              src={COMPANY.logo}
              alt="IKOMS Logo"
              className="block h-14 w-auto max-w-34 object-contain sm:h-20 lg:h-28 sm:max-w-none"
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

          <div className="flex items-center gap-2">                                                             {/* Mobile menu button and Cart */ }
            <button
              type="button"
              className="
                          inline-flex items-center justify-center 
                          rounded-md 
                          p-2 
                          text-gray-200 
                          transition 
                          hover:bg-white/10 hover:text-white 
                          lg:hidden
                        "
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {cartCount > 0 && (
              <Link
                href="/shop/cart"
                className="
                            relative 
                            inline-flex items-center justify-center 
                            rounded-md 
                            p-2 
                            text-gray-200 
                            transition 
                            hover:bg-white/10 hover:text-white sm:hidden
                          "
                aria-label={`Cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              >                                                                                                 {/* Shows cart icon with badge on mobile only when there are items in the cart */ }
                <ShoppingCart className="h-5 w-5" />
                <motion.span
                  key={cartCount}
                  className="
                              absolute -right-0.5 -top-0.5 
                              flex h-4 
                              min-w-4 
                              items-center justify-center 
                              rounded-full 
                              bg-emerald-600 
                              px-1 
                              text-[10px] 
                              leading-none 
                              text-white shadow-sm
                            "
                  initial={{ opacity: 0, rotate: 0, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 360, scale: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >                                                                                               {/* Animated badge showing the number of items in the cart */ }
                  {cartCount}
                </motion.span>
              </Link>
            )}

            <Link
              href="/shop/cart"
              className={`
                          relative hidden 
                          items-center justify-center 
                          rounded-md 
                          p-2 
                          text-gray-200 transition 
                          hover:bg-white/10 hover:text-white 
                          sm:inline-flex 
                          ${cartCount === 0 ? 'opacity-80' : ''}
                        `}
              aria-label={cartCount > 0 ? `Cart with ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Cart'}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] leading-none text-white shadow-sm"
                  initial={{ opacity: 0, rotate: 0, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 360, scale: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <Link
              href="/admin"
              className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="border-t border-white/10 bg-[rgb(36,52,112)] lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
              <nav className="grid gap-2">
                {navigationItems.map((item) => {
                  const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
