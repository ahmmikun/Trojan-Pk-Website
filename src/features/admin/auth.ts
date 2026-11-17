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
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  return { supabase, user: { id: user.id, email: user.email ?? "" }, role: "admin" };
});

/** Use at the top of every admin page and Server Action. Redirects when not allowed. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
