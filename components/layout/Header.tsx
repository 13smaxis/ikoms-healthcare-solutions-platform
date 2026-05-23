"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
