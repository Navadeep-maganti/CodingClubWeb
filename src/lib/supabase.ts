import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client (singleton).
 *
 * Reads credentials from env:
 *   NEXT_PUBLIC_SUPABASE_URL       — project URL, e.g. https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY      — server-side privileged key (FULL access)
 *
 * If the env vars are not set, `getSupabase()` returns `null` and callers
 * should fall back to local storage / unavailable behaviour.
 *
 * IMPORTANT: This client uses the SERVICE ROLE key. It bypasses RLS and must
 * NEVER be exposed to the browser. Only import this from server code
 * (Server Components, API routes, server actions).
 */

let _client: SupabaseClient | null | undefined = undefined

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    _client = null
    return _client
  }

  try {
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    return _client
  } catch (err) {
    console.error("[supabase] failed to init client:", err)
    _client = null
    return _client
  }
}

/**
 * Returns true iff Supabase is configured in the current environment.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null
}

/**
 * The public-facing Supabase URL for building asset URLs.
 * Returns "" if not configured.
 */
export function supabasePublicUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}
