import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Client-side client (safe for browser) — uses SSR client for proper session persistence & auto-refresh
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Ensure a valid session before making authenticated requests.
// Uses getUser() which always validates against the server and triggers
// an automatic token refresh via the refresh token if the JWT is expired.
// If the refresh token itself is dead, clears the stale session so the
// app doesn't keep retrying with invalid credentials.
//
// getUser() has no built-in network timeout, and Telegram's in-app
// WebView can stall requests indefinitely — race it against a timeout so
// callers never hang forever waiting on this.
export async function ensureValidSession() {
  try {
    const { data: { user }, error } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("getUser timed out")), 10000)
      ),
    ]);
    if (error || !user) {
      await supabase.auth.signOut();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

// Admin client (SERVER ONLY - for auth minting)
export const getServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
