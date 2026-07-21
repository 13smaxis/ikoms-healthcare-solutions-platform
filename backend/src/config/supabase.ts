import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabaseUrl || !env.supabaseServiceRoleKey || !env.supabaseAnonKey)                                                      //- Check for required environment variables
{
  throw new Error('Missing required Supabase environment variables');                                                             //- Throw an error if any required environment variable is missing
}

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
export const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

/*
 * Creates an authenticated Supabase client using a JWT token
 * This client can be used to perform actions on behalf of the authenticated user
 */
export function createAuthenticatedClient(token: string) 
{
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export default supabaseAdmin;