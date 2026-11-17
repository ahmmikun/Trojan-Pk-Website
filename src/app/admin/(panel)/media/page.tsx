import { Images } from "lucide-react";
import type { Metadata } from "next";
import { IconTile, PageHeader } from "@/components/admin-ui/display";
import { requireAdmin } from "@/features/admin/auth";
import { MediaLibrary } from "@/features/admin/media/media-library";
import { MEDIA_COLUMNS, toAsset } from "@/features/admin/media/shared";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("media_assets").select(MEDIA_COLUMNS).order("created_at", { ascending: false }).limit(500);
  const assets = (data ?? []).map(toAsset);
  return (
    <>
      <PageHeader
        icon={<IconTile tone="amber" size="lg"><Images /></IconTile>}
        title="Media"
        meta={<span className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-[600] text-zinc-700 tabular-nums">{assets.length}</span>}
        description="Every uploaded image in one place. Uploads from any image field land here too."
      />
      <MediaLibrary assets={assets} />
    </>
  );
}
