"use client";

import { Check, Loader2, Search, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { controlClass } from "@/components/admin-ui/field";
import { Dialog } from "@/components/admin-ui/overlay";
import { cn } from "@/lib/utils";
import { MediaThumb } from "./media-thumb";
import { ACCEPT_ATTR, formatBytes, listMedia, uploadFile, type MediaAsset } from "./use-upload";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: string;
  /** Single mode: the chosen image. */
  onSelect?: (asset: MediaAsset) => void;
  selected?: string | null;
  /** Multi mode (galleries): pick several, returned in the order they were picked. */
  multiple?: boolean;
  onSelectMany?: (assets: MediaAsset[]) => void;
  /** Multi mode: URLs already in the gallery, marked as added. */
  existing?: string[];
};

/** Media library dialog: choose existing images or upload new ones. Used by every image and gallery field. */
export function MediaPicker({ open, onOpenChange, onSelect, folder, selected, multiple, onSelectMany, existing = [] }: Props) {
  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const close = (next: boolean) => {
    if (!next) {
      setPicked([]);
      setUploadError(null);
    }
    onOpenChange(next);
  };

  const shown = (items ?? []).filter((a) => !query || `${a.alt} ${a.path}`.toLowerCase().includes(query.toLowerCase()));
  const focused = picked.at(-1) ?? null;

  const confirm = (list: MediaAsset[]) => {
    if (!list.length) return;
    if (multiple) onSelectMany?.(list);
    else onSelect?.(list[0]!);
    close(false);
  };

  const toggle = (a: MediaAsset) => setPicked((p) => (multiple ? (p.some((x) => x.id === a.id) ? p.filter((x) => x.id !== a.id) : [...p, a]) : [a]));

  async function onFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (!list.length) return;
    setUploadError(null);
    setUploading({ done: 0, total: list.length });
    const added: MediaAsset[] = [];
    for (const file of multiple ? list : list.slice(0, 1)) {
      try {
        added.push(await uploadFile(file, folder));
      } catch (e) {
        setUploadError(`${file.name}: ${(e as Error).message}`);
      }
      setUploading((u) => u && { ...u, done: u.done + 1 });
    }
    setUploading(null);
    if (!added.length) return;
    setItems((cur) => [...added, ...(cur ?? [])]);
    if (multiple) setPicked((p) => [...p, ...added]);
    else confirm(added);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      size="xl"
      title="Media library"
      description={multiple ? "Select one or more images, or upload new ones." : "Choose an image, or upload a new one."}
      footer={
        <>
          <p className="mr-auto truncate text-xs text-muted-foreground">
            {multiple && picked.length ? `${picked.length} selected` : focused ? `${focused.alt || "No alt text"} · ${focused.width ?? "?"}×${focused.height ?? "?"} · ${formatBytes(focused.size_bytes)}` : `${items?.length ?? 0} images`}
          </p>
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button variant="primary" disabled={!picked.length} onClick={() => confirm(picked)}>
            {multiple ? (picked.length > 1 ? `Add ${picked.length} images` : "Add image") : "Use image"}
          </Button>
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
          <Button disabled={uploading !== null} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
            {uploading ? `Uploading ${uploading.done + 1} of ${uploading.total}` : "Upload new"}
          </Button>
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} multiple={multiple} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void onFiles(e.target.files)} />
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
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5" role="listbox" aria-multiselectable={multiple || undefined} aria-label="Images">
            {shown.map((a) => {
              const order = picked.findIndex((x) => x.id === a.id);
              const isPicked = order !== -1;
              const isCurrent = multiple ? existing.includes(a.url) : selected === a.url;
              return (
                <li key={a.id} role="option" aria-selected={isPicked}>
                  <button
                    type="button"
                    onClick={() => toggle(a)}
                    onDoubleClick={() => !multiple && confirm([a])}
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                      isPicked ? "ring-2 ring-foreground" : "ring-1 ring-border hover:ring-foreground/30",
                    )}
                    aria-label={`${a.alt || a.path.split("/").pop()}${isCurrent ? (multiple ? " (already added)" : " (current)") : ""}`}
                  >
                    <MediaThumb src={a.url} className={cn("aspect-square w-full transition-opacity", isCurrent && !isPicked && multiple && "opacity-60")} />
                    {isPicked ? (
                      <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-[0.6875rem] font-[650] text-white tabular-nums shadow" aria-hidden="true">
                        {multiple ? order + 1 : <Check className="size-3" />}
                      </span>
                    ) : isCurrent ? (
                      <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-success text-white shadow" aria-hidden="true">
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
