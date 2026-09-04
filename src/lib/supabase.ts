import { createClient } from "@supabase/supabase-js";

// The main app still uses mentimax-app for its existing auth/data.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ideyxjuptbizfubyokim.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_2SRZQE733Yo0yfxCGxElng_zJPtnBbu";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Classment reads from the richer Menti project. The Menti table exposed to
// the client contains only leaderboard-safe, non-sensitive fields.
const mentiSupabaseUrl =
  import.meta.env.VITE_MENTI_SUPABASE_URL ||
  "https://otydkqjsqozxtjbqgcuw.supabase.co";
const mentiSupabaseKey =
  import.meta.env.VITE_MENTI_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_yXNJgv84AAGlZ44K88IZyQ_4bb0iNtW";

export const mentiSupabase = createClient(mentiSupabaseUrl, mentiSupabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
