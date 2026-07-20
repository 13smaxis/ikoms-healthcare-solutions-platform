import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Service role client - has full access, use only on backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Anon key client - respects RLS policies
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to create authenticated client with user's JWT token
export function createAuthenticatedClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export default supabaseAdmin;