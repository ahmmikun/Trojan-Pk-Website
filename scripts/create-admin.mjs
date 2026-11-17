// One-time setup: create (or reset the password of) the admin account in Supabase Auth.
//
//   node --env-file=.env.local scripts/create-admin.mjs
//
// Needs in .env.local (never commit, never prefix with NEXT_PUBLIC_):
//   SUPABASE_SECRET_KEY   Supabase → Project Settings → API Keys → Secret key (sb_secret_...)
//   ADMIN_EMAIL           the admin's email
//   ADMIN_PASSWORD        the admin's password (12+ characters recommended)
//
// The email must also be in private.admin_invites; a database trigger then adds the new
// account to public.admins with that role. talha@trojanspk.com is invited as owner.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !secret && "SUPABASE_SECRET_KEY", !email && "ADMIN_EMAIL", !password && "ADMIN_PASSWORD"].filter(Boolean);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) {
  console.error(`Could not list users: ${listError.message}`);
  process.exit(1);
}
const existing = list.users.find((u) => u.email?.toLowerCase() === email);

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
  if (error) {
    console.error(`Could not update ${email}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Updated the password for ${email}.`);
} else {
  const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error(`Could not create ${email}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Created ${email}.`);
}

const { data: admin } = await supabase.from("admins").select("role").eq("email", email).maybeSingle();
console.log(admin ? `Admin access: ${admin.role}. Sign in at /admin/login.` : "The account exists but is not in public.admins. Add its email to private.admin_invites, then run this again.");
