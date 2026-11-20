"use client";

import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Library, Loader2, RotateCcw, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media-picker";
import { MediaThumb } from "./media-thumb";
import { ACCEPT_ATTR, uploadFile } from "./use-upload";

type Photo = { src: string; alt: string };

type Item = {
  key: string;
  src: string;
  alt: string;
  status: "done" | "uploading" | "error";
  progress: number;
  /** Local preview (object URL) while uploading. */
  preview?: string;
  file?: File;
  error?: string;
};

type Props = {
  /** Form field name; the photos are submitted as JSON `[{ src, alt }]` in a hidden input. */
  name: string;
  label: string;
  defaultValue: unknown;
  folder: string;
  description?: string;
  error?: string;
  max?: number;
  onChange?: () => void;
};

const PARALLEL = 3;
const newKey = () => crypto.randomUUID();
const isFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

function toItems(value: unknown): Item[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .filter((p): p is Photo => typeof p?.src === "string" && p.src !== "")
    // Index keys for the stored photos: they must match between the server render and hydration.
    .map((p, i) => ({ key: `saved-${i}`, src: p.src, alt: typeof p.alt === "string" ? p.alt : "", status: "done", progress: 100 }));
}

/**
 * Multi-image field for galleries. Upload many files at once (button, drag and drop or
 * the library), see each one's progress, reorder by dragging (or with the arrow buttons),
 * and write alt text per photo. Failed uploads stay in place with Retry.
 */
export function GalleryField({ name, label, defaultValue, folder, description, error, max = 60, onChange }: Props) {
  const id = useId();
  const [items, setItems] = useState<Item[]>(() => toItems(defaultValue));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const done = items.filter((i) => i.status === "done");
  const uploading = items.filter((i) => i.status === "uploading").length;
  const room = Math.max(0, max - items.filter((i) => i.status !== "error").length);
  const value = JSON.stringify(done.map(({ src, alt }) => ({ src, alt })));

  const patch = (key: string, next: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...next } : i)));

  function remove(key: string) {
    setItems((list) => {
      const gone = list.find((i) => i.key === key);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((i) => i.key !== key);
    });
    onChange?.();
  }

  function move(key: string, by: number) {
    setItems((list) => {
      const from = list.findIndex((i) => i.key === key);
      const to = from + by;
      if (from < 0 || to < 0 || to >= list.length) return list;
      const next = [...list];
      next.splice(to, 0, next.splice(from, 1)[0]!);
      return next;
    });
    onChange?.();
  }

  async function runUpload(item: Item) {
    try {
      const asset = await uploadFile(item.file!, folder, { onProgress: (progress) => patch(item.key, { progress }) });
      if (item.preview) URL.revokeObjectURL(item.preview);
      patch(item.key, { status: "done", src: asset.url, alt: asset.alt, progress: 100, preview: undefined, file: undefined, error: undefined });
      onChange?.();
    } catch (e) {
      patch(item.key, { status: "error", error: (e as Error).message, progress: 0 });
    }
  }

  async function addFiles(files: FileList | File[] | null) {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (fileRef.current) fileRef.current.value = "";
    if (!list.length) return;
    const accepted = list.slice(0, room);
    const queued: Item[] = accepted.map((file) => ({ key: newKey(), src: "", alt: "", status: "uploading", progress: 0, preview: URL.createObjectURL(file), file }));
    const skipped = list.length - accepted.length;
    setItems((cur) => [
      ...cur,
      ...queued,
      ...(skipped > 0 ? [{ key: newKey(), src: "", alt: "", status: "error" as const, progress: 0, error: `${skipped} more ${skipped === 1 ? "photo was" : "photos were"} skipped: the gallery holds up to ${max}.` }] : []),
    ]);
    // A few uploads at a time keeps progress smooth without saturating the connection.
    const queue = [...queued];
    await Promise.all(
      Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
        for (let next = queue.shift(); next; next = queue.shift()) await runUpload(next);
      }),
    );
  }

  function retry(item: Item) {
    if (!item.file) return remove(item.key);
    const again = { ...item, status: "uploading" as const, progress: 0, error: undefined };
    patch(item.key, again);
    void runUpload(again);
  }

  // Reorder while dragging over another photo.
  function dragOverItem(e: React.DragEvent, overKey: string) {
    if (isFileDrag(e) || !dragKey || dragKey === overKey) return;
    e.preventDefault();
    setItems((list) => {
      const from = list.findIndex((i) => i.key === dragKey);
      const to = list.findIndex((i) => i.key === overKey);
      if (from < 0 || to < 0) return list;
      const next = [...list];
      next.splice(to, 0, next.splice(from, 1)[0]!);
      return next;
    });
  }

  const zoneProps = {
    onDragOver: (e: React.DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      setFileDrag(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFileDrag(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      setFileDrag(false);
      void addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div className="flex min-w-0 flex-col gap-2" id={name}>
      <input type="hidden" name={name} value={value} />
      <input ref={fileRef} type="file" accept={ACCEPT_ATTR} multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void addFiles(e.target.files)} />

      <div className="flex flex-wrap items-center gap-2">
        <span id={`${id}-label`} className="text-[0.8125rem] font-medium">{label}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-[550] text-muted-foreground tabular-nums">
          {done.length}
          {uploading ? ` + ${uploading} uploading` : ""} / {max}
        </span>
        {items.length ? (
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" disabled={!room} onClick={() => fileRef.current?.click()}>
              <UploadCloud aria-hidden="true" />
              Upload photos
            </Button>
            <Button size="sm" variant="ghost" disabled={!room} onClick={() => setPickerOpen(true)}>
              <Library aria-hidden="true" />
              Library
            </Button>
          </div>
        ) : null}
      </div>

      <div {...zoneProps} role="group" aria-labelledby={`${id}-label`} className="relative">
        {items.length === 0 ? (
          <div
            className={cn(
              "flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
              fileDrag ? "border-blue-500 bg-blue-50/70" : "border-input bg-muted/30",
              error && "border-[#d92d20]/50",
            )}
          >
            <span className="grid size-11 place-items-center rounded-xl border border-border bg-background text-muted-foreground shadow-xs">
              <ImagePlus className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.875rem]">
                <button type="button" onClick={() => fileRef.current?.click()} className="font-[600] underline-offset-2 hover:underline">Upload photos</button>
                <span className="text-muted-foreground"> or drag them here</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Select many at once · JPEG, PNG, WebP or AVIF · up to 10 MB each</p>
            </div>
            <Button size="sm" onClick={() => setPickerOpen(true)}>
              <Library aria-hidden="true" />
              Choose from library
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-label={`${label}, in display order`}>
            {items.map((item, index) => {
              const shown = item.preview ?? item.src;
              return (
                <li
                  key={item.key}
                  draggable={item.status === "done"}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", item.key);
                    setDragKey(item.key);
                  }}
                  onDragEnd={() => {
                    if (dragKey) onChange?.();
                    setDragKey(null);
                  }}
                  onDragOver={(e) => dragOverItem(e, item.key)}
                  className={cn(
                    "group/photo relative flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card shadow-xs transition-[box-shadow,opacity,transform] duration-150",
                    item.status === "error" ? "border-[#d92d20]/40" : "border-border hover:shadow-[var(--shadow-card)]",
                    dragKey === item.key && "scale-[0.98] opacity-40",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {shown ? <MediaThumb src={shown} alt={item.alt} className={cn("size-full transition-[filter] duration-300", item.status === "uploading" && "blur-[1px] brightness-75")} /> : null}

                    {item.status === "done" ? (
                      <>
                        <span className="absolute top-2 left-2 flex h-5 min-w-5 items-center justify-center rounded-md bg-black/60 px-1.5 text-[0.6875rem] font-[650] text-white tabular-nums backdrop-blur-sm">
                          {index + 1}
                        </span>
                        <span className="absolute top-2 left-1/2 hidden -translate-x-1/2 cursor-grab rounded-md bg-black/60 p-0.5 text-white backdrop-blur-sm group-hover/photo:block active:cursor-grabbing" aria-hidden="true">
                          <GripVertical className="size-3.5 rotate-90" />
                        </span>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within/photo:opacity-100 group-hover/photo:opacity-100 max-sm:opacity-100">
                          <PhotoButton label={`Move photo ${index + 1} earlier`} disabled={index === 0} onClick={() => move(item.key, -1)}><ArrowLeft /></PhotoButton>
                          <PhotoButton label={`Move photo ${index + 1} later`} disabled={index === items.length - 1} onClick={() => move(item.key, 1)}><ArrowRight /></PhotoButton>
                          <PhotoButton label={`Remove photo ${index + 1}`} danger onClick={() => remove(item.key)}><X /></PhotoButton>
                        </div>
                      </>
                    ) : null}

                    {item.status === "uploading" ? (
                      <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5 text-[0.75rem] font-[550] text-white drop-shadow">
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                          {item.progress < 100 ? `Uploading ${item.progress}%` : "Saving…"}
                        </span>
                        <div className="h-1 overflow-hidden rounded-full bg-white/30" role="progressbar" aria-label={`Uploading ${item.file?.name ?? "photo"}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full rounded-full bg-white transition-[width] duration-150" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    ) : null}

                    {item.status === "error" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#fef3f2]/95 p-3 text-center">
                        <p className="line-clamp-3 text-[0.75rem] leading-snug text-[#b42318]" role="alert">{item.error}</p>
                        <div className="flex gap-1.5">
                          {item.file ? (
                            <Button size="sm" onClick={() => retry(item)}>
                              <RotateCcw aria-hidden="true" />
                              Retry
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" onClick={() => remove(item.key)}>Dismiss</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <label className="sr-only" htmlFor={`${id}-alt-${item.key}`}>Alt text for photo {index + 1}</label>
                  <input
                    id={`${id}-alt-${item.key}`}
                    value={item.alt}
                    disabled={item.status !== "done"}
                    maxLength={300}
                    onChange={(e) => {
                      patch(item.key, { alt: e.target.value });
                      onChange?.();
                    }}
                    placeholder={item.status === "done" ? "Describe the photo (alt text)" : item.file?.name}
                    className="h-9 w-full min-w-0 border-t border-border bg-transparent px-2.5 text-[0.75rem] outline-none placeholder:text-muted-foreground/80 focus:bg-muted/40 disabled:text-muted-foreground"
                  />
                </li>
              );
            })}

            {room > 0 ? (
              <li>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-[0.8125rem] text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground",
                    fileDrag ? "border-blue-500 bg-blue-50/70 text-blue-700" : "border-input",
                  )}
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                  <span className="font-[550]">Add photos</span>
                  <span className="text-[0.6875rem]">or drop files</span>
                </button>
              </li>
            ) : null}
          </ul>
        )}

        {fileDrag && items.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border-2 border-dashed border-blue-500 bg-blue-50/80 text-sm font-[600] text-blue-700">
            Drop to upload {room < max ? `(room for ${room})` : ""}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-[#b42318]">{error}</p> : <p className="text-xs leading-relaxed text-muted-foreground">{description ?? "Drag photos to reorder. The first photo leads the gallery. Alt text describes each photo for screen readers and search."}</p>}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        folder={folder}
        multiple
        existing={done.map((d) => d.src)}
        onSelectMany={(assets) => {
          const fresh = assets.filter((a) => !done.some((d) => d.src === a.url)).slice(0, room);
          if (!fresh.length) return;
          setItems((cur) => [...cur, ...fresh.map((a) => ({ key: newKey(), src: a.url, alt: a.alt, status: "done" as const, progress: 100 }))]);
          onChange?.();
        }}
      />
    </div>
  );
}

function PhotoButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-md bg-white/95 text-zinc-800 shadow-sm ring-1 ring-black/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5",
        danger ? "hover:bg-[#fef3f2] hover:text-[#b42318]" : "hover:bg-white hover:text-zinc-950",
      )}
    >
      {children}
    </button>
  );
}
