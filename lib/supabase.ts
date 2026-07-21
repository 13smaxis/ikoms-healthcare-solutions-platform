/*
 * This file is part of the ikoms healthcare solutions platform (next).
 * Its job is to connect the app to the Subase database.
 * It exports a single `supabase` client that can be used to query the database.
 * The client is configured with the URL and API key for the database.
 * The client is created using the `createClient` function from the `@supabase/supabase-js` library.
 * The URL and API key are hardcoded in this file, but in a real application they should be stored in environment variables for security reasons.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

/**
 * Client-side Supabase client (use this in React components)
 * Uses anon key - safe to use in browser
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase admin client (use this in API routes)
 * Uses service role key - DO NOT expose to browser
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey // Fallback to anon key if service key missing
);