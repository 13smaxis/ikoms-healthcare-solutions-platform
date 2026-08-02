
/*
 * Responsible for handling authentication-related operations using Supabase.
 * This includes retrieving the current user's auth token and user information.
 * It uses the Supabase client to interact with the authentication service.
 */
import { supabase } from '@/lib/supabase';
import { ensureSessionRecovery } from '@/lib/auth/recovery';

const TOKEN_REFRESH_MARGIN_SECONDS = 10;                                                                                          //- Refresh token if it will expire within the next 10 seconds

async function refreshIfNeeded() 
{
  try {
    const recovered = await ensureSessionRecovery();                                                                              //- Call ensureSessionRecovery to check if the session is valid and recover it if necessary
    if (!recovered)                                                                                                               //- If session recovery failed, log a warning and return null
    {
      console.warn('Auth client: session recovery failed');
      return null;
    }

    const { data, error } = await supabase.auth.getSession();                                                                     //- Get the current session from Supabase
    if (error) 
    {
      console.warn('Auth client: getSession error', error.message ?? error);
      return null;
    }

    const session = data.session;                                                                                                 //- Extract the session object from the response
    if (!session?.access_token)                                                                                                   //- If there is no access token in the session, log a warning and return null
    {
      return null;
    }

    if (!session.expires_at) {
      return session.access_token;
    }

    const expiresAtMs = session.expires_at * 1000;
    const now = Date.now();

    if (expiresAtMs > now + TOKEN_REFRESH_MARGIN_SECONDS * 1000)                                                                  //- Check if the token is still valid for more than the margin
    {
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
export async function getAuthToken(): Promise<string | null> 
{
  return refreshIfNeeded();                                                                                                       //- Call refreshIfNeeded to get the current auth token, refreshing it if necessary
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