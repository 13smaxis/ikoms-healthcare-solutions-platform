/*
 * This file is part of the ikoms healthcare solutions platform (next).
 * Its job is to connect the app to the Subase database.
 * It exports a single `supabase` client that can be used to query the database.
 * The client is configured with the URL and API key for the database.
 * The client is created using the `createClient` function from the `@supabase/supabase-js` library.
 * The URL and API key are hardcoded in this file, but in a real application they should be stored in environment variables for security reasons.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnrcxvjioeqaynzexuic.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImUwMTIyM2FlLWNjODktNDc3Yi04NjViLWE3MDcxMWU4NzIxMCJ9.eyJwcm9qZWN0SWQiOiJwbnJjeHZqaW9lcWF5bnpleHVpYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc2OTY4OTE1LCJleHAiOjIwOTIzMjg5MTUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.800mWxCecXPKQtcag4Mcik6K_7xBC2W3RrQWBEZ44kU';

export const supabase = createClient(supabaseUrl, supabaseKey);