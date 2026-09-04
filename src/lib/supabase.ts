import { createClient } from "@supabase/supabase-js";

// Netlify currently has no VITE_* variables configured, so keep the public
// Supabase connection available in production while still allowing env vars
// to override it for local/dev deployments.
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
