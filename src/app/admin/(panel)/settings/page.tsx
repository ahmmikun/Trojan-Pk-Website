import { ArrowRight, Link2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin-ui/display";
import { requireAdmin } from "@/features/admin/auth";
import { SettingsForm } from "@/features/admin/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("site_settings").select("tagline, description, application_form_url, default_og_image").eq("id", true).maybeSingle(),
    supabase.from("social_links").select("id", { count: "exact", head: true }).not("url", "is", null).eq("published", true),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Site-wide text, links and defaults." />
      <SettingsForm values={data ?? { tagline: "", description: "", application_form_url: null, default_og_image: null }} />
      <Link href="/admin/social" className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-xs transition-colors hover:bg-muted/40 sm:px-5">
        <span className="grid size-8 place-items-center rounded-md border border-border bg-background text-muted-foreground shadow-xs"><Link2 className="size-4" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.8125rem] font-medium">Social and community links</span>
          <span className="block text-xs text-muted-foreground">{count ?? 0} links live in the navbar, hero, footer and Join page.</span>
        </span>
        <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </Link>
    </>
  );
}
