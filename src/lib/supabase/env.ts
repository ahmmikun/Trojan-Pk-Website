/** Supabase settings from the environment. `null` when the site runs without a database. */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function requireSupabaseEnv(): { url: string; key: string } {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).");
  }
  return env;
}

export const MEDIA_BUCKET = "media";

/** Public URL of a file in the media bucket. */
export function mediaUrl(path: string): string {
  return `${requireSupabaseEnv().url}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
