"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FocusRefresh() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const minInterval = 1500; // ms between refreshes to avoid loops
    let lastRefresh = 0;

    const doRefresh = (reason?: string) => {
      try {
        if (!mounted) return;
        const now = Date.now();
        if (now - lastRefresh < minInterval) {
          // eslint-disable-next-line no-console
          console.log('[FocusRefresh] skipping refresh (throttled) due to', reason);
          return;
        }
        lastRefresh = now;
        // eslint-disable-next-line no-console
        console.log('[FocusRefresh] refreshing due to', reason || 'event');
        router.refresh();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[FocusRefresh] refresh failed', e);
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
  }, [router]);

  return null;
}
