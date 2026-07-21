
/*
 * Responsible for handling authentication-related operations using Supabase.
 * This includes retrieving the current user's auth token and user information.
 * It uses the Supabase client to interact with the authentication service.
 */
import { supabase } from '@/lib/supabase';

/**
 * Get the current user's auth token
 * Use this in React components before making authenticated API calls
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      console.warn('No active session found');
      return null;
    }

    return data.session.access_token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
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