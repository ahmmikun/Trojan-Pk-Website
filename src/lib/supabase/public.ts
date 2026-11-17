import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { supabaseEnv } from "./env";

/** Cache tag for a content table. Admin saves call `updateTag(contentTag(table))`. */
export const contentTag = (table: string) => `content:${table}`;

/** How long public pages may serve a cached copy when nobody edits anything (matches the ISR window). */
const REVALIDATE_SECONDS = 3600;

/**
 * Read every published row of a public content table, cached by the Next.js data cache
 * and tagged so an admin save refreshes it right away. No cookies are read, so pages that
 * use this stay statically generated.
 *
 * Returns `null` when Supabase is not configured or the request fails; callers then fall
 * back to the files in src/data, so the site never goes down with the database.
 * Wrapped in React `cache()`, so several sections asking for the same table in one render share one request.
 */
export const readPublished = cache(async function readPublished<Row>(table: string, orderBy: { column: string; ascending?: boolean }[] = []): Promise<Row[] | null> {
  const env = supabaseEnv();
  if (!env) return null;

  const supabase = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: [contentTag(table)] } }),
    },
  });

  let query = supabase.from(table).select("*").eq("published", true);
  for (const o of orderBy) query = query.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false });

  const { data, error } = await query;
  if (error) {
    console.error(`[content] Supabase read of "${table}" failed, using src/data instead: ${error.message}`);
    return null;
  }
  return data as Row[];
}) as <Row>(table: string, orderBy?: { column: string; ascending?: boolean }[]) => Promise<Row[] | null>;
