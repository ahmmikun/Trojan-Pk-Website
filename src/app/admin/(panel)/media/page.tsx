import type { Metadata } from "next";
import { PageHeader } from "@/components/admin-ui/display";
import { requireAdmin } from "@/features/admin/auth";
import { MediaLibrary } from "@/features/admin/media/media-library";
import { MEDIA_COLUMNS, toAsset } from "@/features/admin/media/shared";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("media_assets").select(MEDIA_COLUMNS).order("created_at", { ascending: false }).limit(500);
  return (
    <>
      <PageHeader title="Media" description="Every uploaded image, in one place. Uploads from any image field land here too." />
      <MediaLibrary assets={(data ?? []).map(toAsset)} />
    </>
  );
}
