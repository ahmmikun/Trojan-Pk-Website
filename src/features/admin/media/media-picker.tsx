"use client";

import { Check, Loader2, Search, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { controlClass } from "@/components/admin-ui/field";
import { Dialog } from "@/components/admin-ui/overlay";
import { cn } from "@/lib/utils";
import { MediaThumb } from "./media-thumb";
import { ACCEPT_ATTR, formatBytes, listMedia, useUpload, type MediaAsset } from "./use-upload";

/** Media library dialog: choose an existing image or upload a new one. Used by every image field. */
export function MediaPicker({ open, onOpenChange, onSelect, folder, selected }: { open: boolean; onOpenChange: (open: boolean) => void; onSelect: (asset: MediaAsset) => void; folder: string; selected?: string | null }) {
  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState<MediaAsset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, status, progress, error: uploadError } = useUpload(folder);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    listMedia()
      .then((list) => alive && (setItems(list), setLoadError(null)))
      .catch((e: Error) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [open]);

  const shown = (items ?? []).filter((a) => !query || `${a.alt} ${a.path}`.toLowerCase().includes(query.toLowerCase()));
  const choose = (asset: MediaAsset) => {
    onSelect(asset);
    onOpenChange(false);
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    const asset = await upload(file);
    if (fileRef.current) fileRef.current.value = "";
    if (asset) choose(asset);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="Media library"
      description="Choose an image, or upload a new one."
      footer={
        <>
          <p className="mr-auto truncate text-xs text-muted-foreground">{focused ? `${focused.alt || "No alt text"} · ${focused.width ?? "?"}×${focused.height ?? "?"} · ${formatBytes(focused.size_bytes)}` : `${items?.length ?? 0} images`}</p>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" disabled={!focused} onClick={() => focused && choose(focused)}>Use image</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search images</span>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by alt text or file name" className={cn(controlClass, "h-8 pl-8")} />
          </label>
          <Button disabled={status === "uploading"} onClick={() => fileRef.current?.click()}>
            {status === "uploading" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
            {status === "uploading" ? `Uploading ${progress}%` : "Upload new"}
          </Button>
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
        {uploadError ? <p role="alert" className="text-[0.8125rem] text-[#b42318]">{uploadError}</p> : null}
        {loadError ? <p role="alert" className="text-[0.8125rem] text-[#b42318]">Could not load the library: {loadError}</p> : null}

        {!items && !loadError ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-busy="true" aria-label="Loading images">
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </ul>
        ) : shown.length === 0 ? (
          <p className="py-14 text-center text-[0.8125rem] text-muted-foreground">{items?.length ? "No images match your search." : "The library is empty. Upload the first image."}</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5" role="listbox" aria-label="Images">
            {shown.map((a) => {
              const isFocused = focused?.id === a.id;
              const isCurrent = selected === a.url;
              return (
                <li key={a.id} role="option" aria-selected={isFocused}>
                  <button
                    type="button"
                    onClick={() => setFocused(a)}
                    onDoubleClick={() => choose(a)}
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                      isFocused ? "ring-2 ring-foreground" : "ring-1 ring-border hover:ring-foreground/30",
                    )}
                    aria-label={a.alt || a.path.split("/").pop()}
                  >
                    <MediaThumb src={a.url} className="aspect-square w-full" />
                    {isFocused || isCurrent ? (
                      <span className={cn("absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-white shadow", isFocused ? "bg-foreground" : "bg-success")} aria-hidden="true">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
