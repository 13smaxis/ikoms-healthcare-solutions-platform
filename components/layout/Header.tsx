"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { COMPANY } from '@/lib/constants';

type CartItem = {
  quantity?: number;
};

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
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

  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { to: '/recruitment', label: 'Recruitment' },
    { to: '/training', label: 'Training' },
    { to: '/consultancy', label: 'Consultancy' },
    { to: '/shop', label: 'Shop' },
  ];

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
            {links.map(l => (
              <Link
                key={l.to}
                href={l.to}
                className={`
                            px-4 py-2 
                            rounded-md 
                            text-sm font-medium 
                            transition 
                            ${
                              pathname.startsWith(l.to)
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-gray-300 hover:text-blue-700 hover:bg-slate-50'
                            }
                         `}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/about" 
                  className="
                              px-4 py-2 
                              rounded-md 
                              text-sm font-medium 
                              text-gray-300 
                              hover:text-blue-700 hover:bg-slate-50
                            "
              >
                About
            </Link>
            <Link href="/contact" 
                  className="
                              px-4 py-2 
                              rounded-md 
                              text-sm font-medium 
                              text-gray-300 
                              hover:text-blue-700 hover:bg-slate-50
                            "
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/shop/cart" className="relative p-2 text-gray-300 hover:text-blue-700 rounded-md hover:bg-slate-50">
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
            <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {links.map(l => (
              <Link
                key={l.to}
                href={l.to}
                className={`block px-3 py-2 text-sm font-medium rounded transition ${
                  pathname.startsWith(l.to)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-300 hover:text-blue-700 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/about"
              className={`block px-3 py-2 text-sm font-medium rounded transition ${
                pathname === '/about'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-300 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 text-sm font-medium rounded transition ${
                pathname === '/contact'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-300 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
