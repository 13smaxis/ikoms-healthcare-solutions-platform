import { supabase } from '@/lib/supabase';

const HEALTH_CHECK_TIMEOUT_MS = 5000;
const SUPABASE_REQUEST_TIMEOUT_MS = 8000;
const RECOVERY_LOG_PREFIX = '[auth recovery]';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function logRecovery(stage: string, message: string, details?: Record<string, unknown>) {
  const payload = details ? { stage, ...details } : { stage };
  console.info(`${RECOVERY_LOG_PREFIX} ${message}`, payload);
}

const isInvalidRefreshTokenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /invalid refresh token|refresh token not found/i.test(message);
};

async function clearInvalidSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
    logRecovery('session-recovery', 'Cleared invalid local Supabase session');
  } catch (error) {
    console.warn(`${RECOVERY_LOG_PREFIX} Could not clear invalid local session:`, error);
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  try {
    logRecovery('health-check', 'Checking backend health', { url: '/api/health' });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      });

      const healthy = response.ok;
      logRecovery('health-check', healthy ? 'Backend health check succeeded' : 'Backend health check returned an unhealthy response', {
        status: response.status,
        healthy,
      });
      return healthy;
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error(`${RECOVERY_LOG_PREFIX} Health check failed:`, error);
    return false;
  }
}

export async function rehydrateSupabaseSession(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  logRecovery('session-recovery', 'Starting Supabase session rehydration');

  try {
    const { data: sessionData, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Supabase getSession',
    );
    if (sessionError) {
      if (isInvalidRefreshTokenError(sessionError)) {
        await clearInvalidSession();
      }
      console.warn(`${RECOVERY_LOG_PREFIX} Supabase session rehydration failed:`, sessionError.message ?? sessionError);
      return false;
    }

    if (sessionData.session?.access_token) {
      logRecovery('session-recovery', 'Existing Supabase session found; validating current user', {
        hasAccessToken: true,
      });

      const { data: userData, error: userError } = await withTimeout(
        supabase.auth.getUser(),
        SUPABASE_REQUEST_TIMEOUT_MS,
        'Supabase getUser',
      );
      if (userError) {
        console.warn(`${RECOVERY_LOG_PREFIX} Supabase user rehydration returned an error:`, userError.message ?? userError);
      }

      const recovered = Boolean(userData.user || sessionData.session.access_token);
      logRecovery('session-recovery', recovered ? 'Existing session is usable' : 'Existing session is not usable yet', {
        hasUser: Boolean(userData.user),
        recovered,
      });
      return recovered;
    }

    logRecovery('session-recovery', 'No usable Supabase session found; attempting refresh');

    const { data: refreshData, error: refreshError } = await withTimeout(
      supabase.auth.refreshSession(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Supabase refreshSession',
    );
    if (refreshError || !refreshData.session?.access_token) {
      if (isInvalidRefreshTokenError(refreshError)) {
        await clearInvalidSession();
      }
      console.warn(`${RECOVERY_LOG_PREFIX} Session refresh failed:`, refreshError?.message ?? refreshError);
      return false;
    }

    const { data: userData, error: userError } = await withTimeout(
      supabase.auth.getUser(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Supabase getUser',
    );
    if (userError) {
      console.warn(`${RECOVERY_LOG_PREFIX} Supabase user refresh returned an error:`, userError.message ?? userError);
    }

    const recovered = Boolean(userData.user || refreshData.session.access_token);
    logRecovery('session-recovery', recovered ? 'Session refresh succeeded' : 'Session refresh completed without a usable user', {
      hasUser: Boolean(userData.user),
      recovered,
    });
    return recovered;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearInvalidSession();
    }
    console.error(`${RECOVERY_LOG_PREFIX} Session rehydration crashed:`, error);
    return false;
  }
}

export async function refreshSessionSilently(): Promise<boolean> {
  return rehydrateSupabaseSession();
}

export async function ensureSessionRecovery(): Promise<boolean> {
  const healthy = await checkBackendHealth();
  const rehydrated = await rehydrateSupabaseSession();
  const recovered = healthy && rehydrated;
  logRecovery('session-recovery', recovered ? 'Session recovery completed successfully' : 'Session recovery completed with issues', {
    healthy,
    rehydrated,
    recovered,
  });
  return recovered;
}
