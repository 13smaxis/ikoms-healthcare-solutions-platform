import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useSessionRefresh() {
  const refreshPendingRef = useRef(false);
  const wasHiddenRef = useRef(typeof document !== 'undefined' ? document.hidden : false);

  const shouldSuppressRefresh = () => {
    if (typeof window === 'undefined') return false;
    const suppressUntil = Number((window as any).__suppressFocusRefreshUntil ?? 0);
    return suppressUntil > Date.now();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const refreshSession = async () => {
      if (refreshPendingRef.current || document.hidden || shouldSuppressRefresh()) return;
      refreshPendingRef.current = true;

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('⚠️ Admin session refresh skipped: getSession failed', sessionError.message ?? sessionError);
          return;
        }

        if (!sessionData.session?.refresh_token) {
          return;
        }

        console.log('🔄 Admin session refresh triggered');
        const { data, error } = await supabase.auth.refreshSession();

        if (error || !data.session?.access_token) {
          console.warn('⚠️ Admin session expired or refresh failed', error?.message ?? error);
          await supabase.auth.signOut().catch(() => undefined);
          return;
        }

        console.log('✅ Admin session refreshed', {
          userEmail: data.session.user?.email,
          expiresAt: data.session.expires_at,
        });
      } catch (err) {
        console.error('❌ Admin session refresh failed:', err);
      } finally {
        refreshPendingRef.current = false;
      }
    };

    const reloadOnResume = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        return;
      }

      if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        if (shouldSuppressRefresh()) return;
        console.log('🔄 Admin session resume detected; refreshing session silently');
        refreshSession();
      }
    };

    const handleFocus = () => {
      reloadOnResume();
      refreshSession();
    };
    const handleVisibility = () => {
      reloadOnResume();
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };

    const handleSoftFocusRefresh = () => {
      if (shouldSuppressRefresh()) return;
      refreshSession();
    };

    refreshSession();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('soft-focus-refresh', handleSoftFocusRefresh as EventListener);
    };
  }, []);
}