"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type NavItem = { id: string; title: string; handle: string };

export default function ShopOverlayMenu({ className }: { className?: string }) 
{
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NavItem[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {                                                                                             //-Fetch menu data once on mount
    let mounted = true; 
    fetch('/api/shop-nav')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {                                                                                            //-Fallback to sensible defaults
        setItems([
          { id: 'ppe-protective-gear', title: 'PPE & Protective Gear', handle: 'ppe-protective-gear' },
          { id: 'equipment-supplies', title: 'Equipment & Supplies', handle: 'equipment-supplies' },
          { id: 'uniforms-apparel', title: 'Uniforms & Apparel', handle: 'uniforms-apparel' },
          { id: 'learning-resources', title: 'Learning Resources', handle: 'learning-resources' },
        ]);
      });
    return () => { mounted = false; };
  }, []);                                                                                                       //-[] run only once on mount

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // simple scroll lock & focus management
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
      // move focus to panel
      setTimeout(() => panelRef.current?.focus(), 10);
    } else {
      document.body.style.overflow = prev;
      // restore focus to trigger
      triggerRef.current?.focus();
    }
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const onNavigate = (handle: string) => {
    setOpen(false);
    router.push(`/shop/collections/${handle}`);
  };

  return (
    <div>
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch" aria-hidden={false}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            id="shop-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-overlay-title"
            ref={panelRef}
            tabIndex={-1}
            className="relative m-auto flex h-full w-full max-w-4xl flex-col items-start justify-center gap-8 overflow-hidden bg-white px-8 py-12 text-slate-900 shadow-2xl focus:outline-none animate-menu-open"
            style={{ borderRadius: '0.5rem' }}
          >
            <div className="absolute top-6 right-6">
              <button onClick={() => setOpen(false)} className="rounded-md bg-slate-100 px-3 py-2">Close</button>
            </div>

            <h2 id="shop-overlay-title" className="w-full text-4xl font-bold leading-tight">Shop</h2>

            <nav className="w-full">
              <ul className="flex flex-col gap-6">
                {items.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => onNavigate(it.handle)}
                      className="text-3xl font-semibold text-slate-900 hover:text-rose-700"
                    >
                      {it.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
