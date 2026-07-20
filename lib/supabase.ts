/*
 * This file is part of the ikoms healthcare solutions platform (next).
 * Its job is to connect the app to the Subase database.
 * It exports a single `supabase` client that can be used to query the database.
 * The client is configured with the URL and API key for the database.
 * The client is created using the `createClient` function from the `@supabase/supabase-js` library.
 * The URL and API key are hardcoded in this file, but in a real application they should be stored in environment variables for security reasons.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywnndcmqwrezbckhdwmi.supabase.co';
const supabaseKey = 'sb_publishable_NLpSJcpEZVpdTByNcgEeJQ__sYcEbP8';

export const supabase = createClient(supabaseUrl, supabaseKey);