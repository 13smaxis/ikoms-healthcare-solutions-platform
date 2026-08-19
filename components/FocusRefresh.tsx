"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FocusRefresh() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const minInterval = 1500;
    let lastRefresh = 0;
    let leftPage = document.visibilityState === 'hidden';

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

        console.log('[FocusRefresh] refreshing page data after', reason || 'event');
        router.refresh();
        window.dispatchEvent(new CustomEvent('soft-focus-refresh', { detail: { reason } }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[FocusRefresh] soft refresh failed', e);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        leftPage = true;
      } else if (leftPage) {
        leftPage = false;
        doRefresh('visibilitychange');
      }
    };

    const onBlur = () => {
      leftPage = true;
    };

    const onFocus = () => {
      if (leftPage) {
        leftPage = false;
        doRefresh('focus');
      }
    };
    const onPageShow = (ev: PageTransitionEvent) => {
      if (ev.persisted) {
        doRefresh('pageshow-persisted');
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow as EventListener);
    };
  }, [router]);

  return null;
}
