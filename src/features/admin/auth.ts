import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string };
  role: "admin";
};

/**
 * The signed-in admin, or null. A Supabase account alone is not enough: the user must
 * also be listed in public.admins. There is one role: admins can change everything,
 * everyone else can only view the site. Cached per request.
 *
 * getClaims() verifies the session JWT's signature locally (asymmetric key, JWKS cached
 * per server process), so this costs one database query instead of an extra Auth round trip.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", sub).maybeSingle();
  if (!admin) return null;
  return { supabase, user: { id: sub, email: String(data.claims.email ?? "") }, role: "admin" };
});

/** Use at the top of every admin page and Server Action. Redirects when not allowed. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
