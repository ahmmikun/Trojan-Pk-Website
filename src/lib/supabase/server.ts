import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * Supabase client bound to the visitor's session cookie. Used by /admin pages and Server
 * Actions, so every query runs as the signed-in user under Row Level Security.
 * Reading cookies makes the route dynamic; public pages use `./public` instead.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = requireSupabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
