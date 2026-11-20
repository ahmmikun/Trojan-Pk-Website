"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, requireSupabaseEnv } from "@/lib/supabase/env";
import { MEDIA_COLUMNS, toAsset, validateFile, type MediaAsset } from "./shared";

/**
 * The only upload code in the admin. Validates the file, uploads it straight from the
 * browser to Supabase Storage with real progress, then records it in the media library.
 * Storage policies accept uploads from admins only.
 */

export { ACCEPT_ATTR, ACCEPTED_TYPES, formatBytes, MAX_BYTES, MEDIA_COLUMNS, toAsset, validateFile, type MediaAsset } from "./shared";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** Turn a file name into readable starter alt text ("team-photo_2026.jpg" → "team photo 2026"). */
function altFromName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
}

async function readDimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

export async function listMedia(): Promise<MediaAsset[]> {
  const { data, error } = await createClient().from("media_assets").select(MEDIA_COLUMNS).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toAsset);
}

type UploadState = { status: "idle" | "uploading" | "done" | "error"; progress: number; error: string | null };

type UploadOptions = { alt?: string; onProgress?: (percent: number) => void; onXhr?: (xhr: XMLHttpRequest) => void };

/**
 * Upload one file and record it in the media library. Throws an Error with a readable
 * message on failure. Used by `useUpload` (single image) and the gallery (many at once).
 */
export async function uploadFile(file: File, folder: string, { alt, onProgress, onXhr }: UploadOptions = {}): Promise<MediaAsset> {
  const problem = validateFile(file);
  if (problem) throw new Error(problem);

  const supabase = createClient();
  const { url, key } = requireSupabaseEnv();
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) throw new Error("Your session has expired. Sign in again.");

  const safeFolder = folder.replace(/[^a-z0-9-]/g, "") || "uploads";
  const path = `${safeFolder}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${EXT[file.type]}`;

  // XHR instead of fetch for upload progress events.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    onXhr?.(xhr);
    xhr.open("POST", `${url}/storage/v1/object/${MEDIA_BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Cache-Control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string };
        if (body.message?.includes("row-level security")) message = "Your account is not allowed to upload.";
        else if (body.message) message = `Upload failed: ${body.message}`;
      } catch {}
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(file);
  });

  const { width, height } = await readDimensions(file);
  const { data, error } = await supabase
    .from("media_assets")
    .insert({ path, alt: (alt ?? altFromName(file.name)).slice(0, 300), width, height, mime_type: file.type, size_bytes: file.size })
    .select(MEDIA_COLUMNS)
    .single();
  if (error) throw new Error(`Uploaded, but saving it to the library failed: ${error.message}`);
  return toAsset(data);
}

export function useUpload(folder: string) {
  const [state, setState] = useState<UploadState>({ status: "idle", progress: 0, error: null });
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const upload = useCallback(
    async (file: File, alt?: string): Promise<MediaAsset | null> => {
      setState({ status: "uploading", progress: 0, error: null });
      try {
        const asset = await uploadFile(file, folder, {
          alt,
          onXhr: (xhr) => (xhrRef.current = xhr),
          onProgress: (progress) => setState((s) => ({ ...s, progress })),
        });
        setState({ status: "done", progress: 100, error: null });
        return asset;
      } catch (e) {
        setState({ status: "error", progress: 0, error: (e as Error).message });
        return null;
      } finally {
        xhrRef.current = null;
      }
    },
    [folder],
  );

  const cancel = useCallback(() => xhrRef.current?.abort(), []);
  const reset = useCallback(() => setState({ status: "idle", progress: 0, error: null }), []);

  return { ...state, upload, cancel, reset };
}
