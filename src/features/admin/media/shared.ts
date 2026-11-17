import { MEDIA_BUCKET, requireSupabaseEnv } from "@/lib/supabase/env";

/** Media types and helpers shared by server pages and client components. */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");
export const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket limit
export const MEDIA_COLUMNS = "id, path, alt, width, height, size_bytes, mime_type, created_at";

export type MediaAsset = {
  id: string;
  path: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
};

export function toAsset(row: Omit<MediaAsset, "url">): MediaAsset {
  return { ...row, url: `${requireSupabaseEnv().url}/storage/v1/object/public/${MEDIA_BUCKET}/${row.path}` };
}

export function validateFile(file: File): string | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return `${file.name}: use a JPEG, PNG, WebP or AVIF image.`;
  if (file.size > MAX_BYTES) return `${file.name} is ${(file.size / 1048576).toFixed(1)} MB. The limit is 10 MB.`;
  return null;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "";
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
