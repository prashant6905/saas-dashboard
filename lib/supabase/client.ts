import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-commandcenter.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-commandcenter-anon-key";

/**
 * Creates a browser-side Supabase client with cookie storage support.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
