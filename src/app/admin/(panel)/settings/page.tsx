import { ArrowRight, Link2, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconTile, PageHeader } from "@/components/admin-ui/display";
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
      <PageHeader icon={<IconTile tone="zinc" size="lg"><Settings /></IconTile>} title="Settings" description="Site-wide text, links and defaults." />
      <SettingsForm values={data ?? { tagline: "", description: "", application_form_url: null, default_og_image: null }} />
      <Link href="/admin/social" className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-[var(--shadow-card)] transition-colors hover:border-zinc-300 hover:bg-zinc-50">
        <IconTile tone="blue"><Link2 /></IconTile>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.875rem] font-[600] text-zinc-900">Social and community links</span>
          <span className="block text-xs text-zinc-500">{count ?? 0} links live in the navbar, hero, footer and Join page.</span>
        </span>
        <ArrowRight className="size-4 text-zinc-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </>
  );
}
