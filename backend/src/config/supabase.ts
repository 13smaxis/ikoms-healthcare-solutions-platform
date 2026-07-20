import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabaseUrl || !env.supabaseServiceRoleKey || !env.supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
export const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

export function createAuthenticatedClient(token: string) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export default supabaseAdmin;