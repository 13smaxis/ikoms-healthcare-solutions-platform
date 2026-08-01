
/*
 * Responsible for handling authentication-related operations using Supabase.
 * This includes retrieving the current user's auth token and user information.
 * It uses the Supabase client to interact with the authentication service.
 */
import { supabase } from '@/lib/supabase';

const TOKEN_REFRESH_MARGIN_SECONDS = 60;

async function refreshIfNeeded() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Auth client: getSession error', error.message ?? error);
      return null;
    }

    const session = data.session;
    if (!session?.access_token) {
      return null;
    }

    if (!session.expires_at) {
      return session.access_token;
    }

    const expiresAtMs = session.expires_at * 1000;
    const now = Date.now();

    if (expiresAtMs > now + TOKEN_REFRESH_MARGIN_SECONDS * 1000) {
      return session.access_token;
    }

    const refreshResult = await supabase.auth.refreshSession();
    if (refreshResult.error || !refreshResult.data.session?.access_token) {
      console.warn('Auth client: refreshSession failed', refreshResult.error?.message ?? refreshResult.error);
      return null;
    }

    return refreshResult.data.session.access_token;
  } catch (error) {
    console.error('Auth client: getAuthToken failed', error);
    return null;
  }
}

/**
 * Get the current user's auth token
 * Use this in React components before making authenticated API calls
 */
export async function getAuthToken(): Promise<string | null> {
  return refreshIfNeeded();
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.warn('No user found');
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}