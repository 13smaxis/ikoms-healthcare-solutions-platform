import { useEffect, useRef } from 'react';
import { ensureSessionRecovery } from '@/lib/auth/recovery';

export function useSessionRefresh() {
  const refreshPendingRef = useRef(false);

  const shouldSuppressRefresh = () => {
    if (typeof window === 'undefined') return false;
    const suppressUntil = Number((window as any).__suppressFocusRefreshUntil ?? 0);
    return suppressUntil > Date.now();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const refreshSession = async (reason = 'event') => {
      if (refreshPendingRef.current || shouldSuppressRefresh()) return;
      refreshPendingRef.current = true;

      console.info('[focus recovery] starting recovery check', {
        reason,
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });

      try {
        const recovered = await ensureSessionRecovery();
        if (!recovered) {
          console.warn('⚠️ Admin session recovery failed', { reason, hidden: document.hidden });
          return;
        }

        console.log('✅ Admin session refreshed silently', { reason, hidden: document.hidden });
      } catch (err) {
        console.error('❌ Admin session refresh failed:', err);
      } finally {
        refreshPendingRef.current = false;
      }
    };

    const handleSoftFocusRefresh = () => {
      if (shouldSuppressRefresh()) return;
      refreshSession('soft-focus');
    };

    const keepAlive = window.setInterval(() => {
      refreshSession('keepalive');
    }, 4 * 60 * 1000);

    refreshSession('startup');
    window.addEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);

    return () => {
      window.clearInterval(keepAlive);
      window.removeEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);
    };
  }, []);
}