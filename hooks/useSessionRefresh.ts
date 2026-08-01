import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useSessionRefresh() {
  const refreshPendingRef = useRef(false);
  const wasHiddenRef = useRef(document.hidden);

  useEffect(() => {
    const refreshSession = async () => {
      if (refreshPendingRef.current || document.hidden) return;
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
        window.location.reload();
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

    refreshSession();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}