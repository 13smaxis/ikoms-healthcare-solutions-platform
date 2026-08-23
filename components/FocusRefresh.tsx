"use client";

import { useEffect } from 'react';

export default function FocusRefresh() {
  useEffect(() => {
    let lastRefreshAt = 0;

    const refreshOnFocus = () => {
      const now = Date.now();
      if (now - lastRefreshAt < 500) return;
      lastRefreshAt = now;

      window.dispatchEvent(new Event('soft-focus-refresh'));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshOnFocus();
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
