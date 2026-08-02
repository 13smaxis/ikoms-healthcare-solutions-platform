"use client";

import { useEffect } from 'react';

export default function FocusRefresh() {
  useEffect(() => {
    let mounted = true;
    const minInterval = 1500; // ms between refresh events to avoid loops
    let lastRefresh = 0;

    const shouldSuppressRefresh = () => {
      if (typeof window === 'undefined') return false;
      const suppressUntil = Number((window as any).__suppressFocusRefreshUntil ?? 0);
      return suppressUntil > Date.now();
    };

    const doRefresh = (reason?: string) => {
      try {
        if (!mounted) return;
        if (shouldSuppressRefresh()) {
          // eslint-disable-next-line no-console
          console.log('[FocusRefresh] refresh suppressed due to active file upload dialog', reason);
          return;
        }

        const now = Date.now();
        if (now - lastRefresh < minInterval) {
          // eslint-disable-next-line no-console
          console.log('[FocusRefresh] skipping soft refresh (throttled) due to', reason);
          return;
        }
        lastRefresh = now;

        // eslint-disable-next-line no-console
        console.log('[FocusRefresh] soft refresh event due to', reason || 'event');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('soft-focus-refresh', { detail: { reason } }));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[FocusRefresh] soft refresh failed', e);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') doRefresh('visibilitychange');
    };

    const onFocus = () => doRefresh('focus');
    const onPageShow = (ev: PageTransitionEvent) => {
      if (ev.persisted) doRefresh('pageshow-persisted');
      else doRefresh('pageshow');
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow as EventListener);
    };
  }, []);

  return null;
}
