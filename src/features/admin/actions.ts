"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { MEDIA_BUCKET, supabaseEnv } from "@/lib/supabase/env";
import { contentTag } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { describeDbError, httpsUrl, KEY_RE, parseForm, UUID_RE, validImage, type FieldErrors } from "./parse";
import { getResource, imageColumns, RESOURCE_LIST, type Resource } from "./resources";

/**
 * Every admin write goes through these Server Actions. Each one re-checks the session
 * (requireAdmin) and validates its arguments, because bound arguments and form data both
 * come from the browser. Row Level Security enforces the same rules in the database.
 */

export type SaveState = { status: "idle" | "saved" | "error"; message: string | null; errors: FieldErrors; savedAt?: number };
export type Result = { ok: true } | { ok: false; error: string };

function resolve(resourceKey: string, id: string | null): Resource {
  const resource = getResource(resourceKey);
  if (!resource) throw new Error("Unknown content type.");
  if (id !== null && !(resource.idKind === "uuid" ? UUID_RE : KEY_RE).test(id)) throw new Error("Invalid id.");
  return resource;
}

/** Public pages that read this table rebuild on their next visit; admin views refresh now. */
function refresh(resource: Resource) {
  updateTag(contentTag(resource.table));
  revalidatePath("/admin", "layout");
}

export async function saveItem(resourceKey: string, id: string | null, _prev: SaveState, form: FormData): Promise<SaveState> {
  const resource = resolve(resourceKey, id);
  const { supabase } = await requireAdmin();
  const { values, errors } = parseForm(resource, form, id === null);
  const count = Object.keys(errors).length;
  if (count) return { status: "error", message: count === 1 ? "1 field needs attention." : `${count} fields need attention.`, errors };

  const query =
    id === null
      ? supabase.from(resource.table).insert(values).select(resource.idColumn).single()
      : supabase.from(resource.table).update(values).eq(resource.idColumn, id).select(resource.idColumn).single();
  const { data, error } = await query;
  if (error) {
    const { field, message } = describeDbError(resource, error);
    return { status: "error", message, errors: field ? { [field]: message } : {} };
  }

  refresh(resource);
  if (id === null) redirect(`/admin/${resource.key}/${encodeURIComponent(String((data as unknown as Record<string, unknown>)[resource.idColumn]))}?created=1`);
  return { status: "saved", message: "Changes saved", errors: {}, savedAt: Date.now() };
}

export async function setPublished(resourceKey: string, id: string, published: boolean): Promise<Result> {
  const resource = resolve(resourceKey, id);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(resource.table).update({ published }).eq(resource.idColumn, id);
  if (error) return { ok: false, error: describeDbError(resource, error).message };
  refresh(resource);
  return { ok: true };
}

export async function duplicateItem(resourceKey: string, id: string): Promise<Result> {
  const resource = resolve(resourceKey, id);
  if (resource.idKind !== "uuid") return { ok: false, error: "This entry cannot be duplicated." };
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from(resource.table).select("*").eq("id", id).single();
  if (error || !row) return { ok: false, error: "This entry no longer exists." };

  const copy: Record<string, unknown> = { ...row };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  if (typeof copy.slug === "string") copy.slug = `${copy.slug}-copy-${crypto.randomUUID().slice(0, 4)}`.slice(0, 120);
  if (typeof copy[resource.titleField] === "string") copy[resource.titleField] = `${copy[resource.titleField]} (copy)`;
  copy.published = false;

  const { data, error: insertError } = await supabase.from(resource.table).insert(copy).select("id").single();
  if (insertError) return { ok: false, error: describeDbError(resource, insertError).message };
  refresh(resource);
  redirect(`/admin/${resource.key}/${data.id}?created=1`);
}

export async function deleteItem(resourceKey: string, id: string, redirectToList = true): Promise<Result> {
  const resource = resolve(resourceKey, id);
  const { supabase } = await requireAdmin();
  const { error, count } = await supabase.from(resource.table).delete({ count: "exact" }).eq(resource.idColumn, id);
  if (error) return { ok: false, error: describeDbError(resource, error).message };
  if (!count) return { ok: false, error: "Nothing was deleted. The entry may already be gone." };
  refresh(resource);
  if (redirectToList) redirect(`/admin/${resource.key}?deleted=1`);
  return { ok: true };
}

/* ---------- Site settings ---------- */

export async function saveSettings(_prev: SaveState, form: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  const errors: FieldErrors = {};
  const text = (k: string) => String(form.get(k) ?? "").trim();

  const tagline = text("tagline");
  const description = text("description");
  const formUrl = text("application_form_url");
  const ogImage = text("default_og_image");
  if (!tagline) errors.tagline = "Tagline is required.";
  if (tagline.length > 80) errors.tagline = "Keep it under 80 characters.";
  if (!description) errors.description = "Description is required.";
  if (description.length > 300) errors.description = "Keep it under 300 characters.";
  if (formUrl && !httpsUrl(formUrl)) errors.application_form_url = "Use a full https:// link.";
  if (ogImage && !validImage(ogImage)) errors.default_og_image = "Upload an image or choose one from the library.";
  if (Object.keys(errors).length) return { status: "error", message: "Some fields need attention.", errors };

  const { error } = await supabase
    .from("site_settings")
    .update({ tagline, description, application_form_url: formUrl || null, default_og_image: ogImage || null })
    .eq("id", true);
  if (error) return { status: "error", message: `Could not save: ${error.message}`, errors: {} };

  updateTag(contentTag("site_settings"));
  revalidatePath("/admin", "layout");
  return { status: "saved", message: "Settings saved", errors: {}, savedAt: Date.now() };
}

/* ---------- Media ---------- */

export type MediaUsage = { resource: string; label: string; title: string; href: string };

/** Content that references an image URL. Deleting a file that is in use would break those pages. */
export async function getMediaUsage(url: string): Promise<MediaUsage[]> {
  const { supabase } = await requireAdmin();
  if (!validImage(url)) return [];
  const uses: MediaUsage[] = [];
  await Promise.all(
    RESOURCE_LIST.map(async (r) => {
      const columns = imageColumns(r);
      const filters = columns.map((c) => `${c}.eq.${JSON.stringify(url)}`);
      const queries = [];
      if (filters.length) queries.push(supabase.from(r.table).select(`${r.idColumn}, ${r.titleField}`).or(filters.join(",")).limit(20));
      if (r.table === "achievements") queries.push(supabase.from(r.table).select(`${r.idColumn}, ${r.titleField}`).contains("images", [{ src: url }]).limit(20));
      for (const { data } of await Promise.all(queries)) {
        for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
          uses.push({ resource: r.key, label: r.singular, title: String(row[r.titleField] ?? "Untitled"), href: `/admin/${r.key}/${encodeURIComponent(String(row[r.idColumn]))}` });
        }
      }
    }),
  );
  const { data: settings } = await supabase.from("site_settings").select("id").eq("default_og_image", url).limit(1);
  if (settings?.length) uses.push({ resource: "settings", label: "Settings", title: "Default social image", href: "/admin/settings" });
  return uses;
}

export async function deleteMedia(id: string): Promise<Result> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid id." };
  const { supabase } = await requireAdmin();
  const { data: asset } = await supabase.from("media_assets").select("path").eq("id", id).single();
  if (!asset) return { ok: false, error: "This file no longer exists." };

  const env = supabaseEnv();
  const url = env ? `${env.url}/storage/v1/object/public/${MEDIA_BUCKET}/${asset.path}` : "";
  const usage = url ? await getMediaUsage(url) : [];
  if (usage.length) return { ok: false, error: `In use by ${usage.length} ${usage.length === 1 ? "entry" : "entries"}: ${usage.map((u) => u.title).join(", ")}. Replace it there first.` };

  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([asset.path]);
  if (storageError) return { ok: false, error: `Could not delete the file: ${storageError.message}` };
  await supabase.from("media_assets").delete().eq("id", id);
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function updateMediaAlt(id: string, alt: string): Promise<Result> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid id." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("media_assets").update({ alt: alt.trim().slice(0, 300) }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/media");
  return { ok: true };
}
