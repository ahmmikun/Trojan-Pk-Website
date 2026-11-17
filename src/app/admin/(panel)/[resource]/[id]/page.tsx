import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/features/admin/auth";
import { ItemEditor } from "@/features/admin/editor/item-editor";
import { UUID_RE, KEY_RE } from "@/features/admin/parse";
import { getResource } from "@/features/admin/resources";

async function load(resourceKey: string, rawId: string) {
  const resource = getResource(resourceKey);
  const id = decodeURIComponent(rawId);
  if (!resource || !(resource.idKind === "uuid" ? UUID_RE : KEY_RE).test(id)) return null;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from(resource.table).select("*").eq(resource.idColumn, id).maybeSingle();
  return data ? { resource, id, row: data as Record<string, unknown> } : null;
}

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/[id]">): Promise<Metadata> {
  const { resource, id } = await params;
  const item = await load(resource, id);
  return { title: item ? String(item.row[item.resource.titleField] ?? item.resource.singular) : "Not found" };
}

export default async function EditItemPage({ params, searchParams }: PageProps<"/admin/[resource]/[id]">) {
  const p = await params;
  const item = await load(p.resource, p.id);
  if (!item) notFound();
  const { resource, id, row } = item;
  const sp = await searchParams;

  return (
    <ItemEditor
      // Remount with fresh defaults after every save.
      key={String(row.updated_at)}
      resourceKey={resource.key}
      id={id}
      values={row}
      siteUrl={siteConfig.url}
      publicHref={row.published ? (resource.publicPath?.(row) ?? null) : null}
      justCreated={sp.created === "1"}
    />
  );
}
