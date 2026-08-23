"use client";

import { useEffect } from 'react';

export default function FocusRefresh() {
  useEffect(() => {
    const onFocus = () => {
      const suppressUntil = Number((window as any).__suppressFocusRefreshUntil ?? 0);
      if (suppressUntil > Date.now()) return;

      window.location.reload();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
