"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type WishlistContextType = {
  wishlist: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
};

const ctx = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ikoms_wishlist');
      if (raw) setWishlist(JSON.parse(raw));
    } catch (e) { setWishlist([]); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ikoms_wishlist', JSON.stringify(wishlist)); } catch (e) {}
  }, [wishlist]);

  const addToWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev : [...prev, id]);
  const removeFromWishlist = (id: string) => setWishlist(prev => prev.filter(x => x !== id));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <ctx.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
      {children}
    </ctx.Provider>
  );
};

export function useWishlist() {
  const v = useContext(ctx);
  if (!v) throw new Error('useWishlist must be used within WishlistProvider');
  return v;
}
