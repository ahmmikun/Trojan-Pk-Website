"use client";

import { ImagePlus, Library, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { controlClass } from "@/components/admin-ui/field";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media-picker";
import { MediaThumb } from "./media-thumb";
import { ACCEPT_ATTR, useUpload } from "./use-upload";

type Props = {
  /** Form field name; the value (image URL or /public path) is submitted in a hidden input. */
  name: string;
  label: string;
  defaultValue?: string | null;
  /** Storage folder for new uploads, e.g. "events". */
  folder: string;
  description?: string;
  error?: string;
  /** Aspect ratio of the preview, matching where the image is used. */
  aspect?: "video" | "square" | "portrait" | "wide";
  onChange?: (value: string) => void;
  /** Compact single-row variant for repeater cells. */
  compact?: boolean;
};

const ASPECT = { video: "aspect-video", square: "aspect-square", portrait: "aspect-[4/5]", wide: "aspect-[1200/630]" };

/**
 * The reusable image input. Empty: a dropzone (click, drag a file, or open the library).
 * Filled: a preview with Replace, Library and Remove. Shows upload progress and errors
 * inline, and accepts a /public path for files that ship with the site.
 */
export function MediaField({ name, label, defaultValue, folder, description, error, aspect = "video", onChange, compact }: Props) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, status, progress, error: uploadError, cancel, reset } = useUpload(folder);
  const busy = status === "uploading";
  const message = uploadError ?? error;

  const set = (next: string) => {
    setValue(next);
    reset();
    onChange?.(next);
  };

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const asset = await upload(file);
    if (fileRef.current) fileRef.current.value = "";
    if (asset) set(asset.url);
  }

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!busy) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!busy) void handleFile(e.dataTransfer.files[0]);
    },
  };

  const fileInput = <input ref={fileRef} type="file" accept={ACCEPT_ATTR} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void handleFile(e.target.files?.[0])} />;
  const picker = <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(a) => set(a.url)} folder={folder} selected={value} />;
  const progressBar = busy ? (
    <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-label="Upload progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-foreground transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  ) : null;

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2" {...dropProps}>
        <input type="hidden" name={name} value={value} />
        <MediaThumb src={value} className="size-8 shrink-0 rounded-md ring-1 ring-border" />
        <Button size="sm" disabled={busy} onClick={() => fileRef.current?.click()} aria-label={`Upload ${label}`}>
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
          {busy ? `${progress}%` : value ? "Replace" : "Upload"}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setPickerOpen(true)} aria-label={`Choose ${label} from the library`} title="Library">
          <Library aria-hidden="true" />
        </Button>
        {message ? <span className="truncate text-xs text-[#b42318]" title={message}>{message}</span> : null}
        {fileInput}
        {picker}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-end justify-between gap-3">
        <span id={`${id}-label`} className="text-[0.8125rem] font-medium">{label}</span>
        <button type="button" onClick={() => setShowPath((s) => !s)} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
          {showPath ? "Hide path" : "Use a path"}
        </button>
      </div>
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/40" {...dropProps}>
          <MediaThumb src={value} className={cn("w-full", ASPECT[aspect], "max-h-80")} />
          <div className={cn("absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm transition-opacity", dragging || busy ? "opacity-100" : "pointer-events-none opacity-0")}>
            <div className="flex w-48 flex-col items-center gap-2 text-[0.8125rem]">
              {busy ? (
                <>
                  <span>Uploading… {progress}%</span>
                  {progressBar}
                  <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
                </>
              ) : (
                <span className="font-medium">Drop to replace</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 border-t border-border bg-background px-2 py-1.5">
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
              <UploadCloud aria-hidden="true" />
              Replace
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setPickerOpen(true)}>
              <Library aria-hidden="true" />
              Library
            </Button>
            <Button size="sm" variant="danger-ghost" disabled={busy} onClick={() => set("")} className="ml-auto">
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...dropProps}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
            ASPECT[aspect],
            "max-h-64 min-h-40",
            dragging ? "border-foreground/40 bg-muted" : "border-input bg-muted/30",
            message && "border-[#d92d20]/50",
          )}
          role="group"
          aria-labelledby={`${id}-label`}
        >
          {busy ? (
            <div className="flex w-52 flex-col items-center gap-2 text-[0.8125rem]">
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <span>Uploading… {progress}%</span>
              {progressBar}
              <Button size="sm" variant="ghost" onClick={cancel}>
                <X aria-hidden="true" />
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground shadow-xs">
                <ImagePlus className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.8125rem]">
                  <button type="button" onClick={() => fileRef.current?.click()} className="font-medium underline-offset-2 hover:underline">Upload an image</button>
                  <span className="text-muted-foreground"> or drag it here</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF · up to 10 MB</p>
              </div>
              <Button size="sm" onClick={() => setPickerOpen(true)}>
                <Library aria-hidden="true" />
                Choose from library
              </Button>
            </>
          )}
        </div>
      )}

      {showPath ? (
        <input value={value} onChange={(e) => set(e.target.value)} placeholder="/samples/events/talk.jpg" aria-label={`${label}: path or URL`} spellCheck={false} className={cn(controlClass, "h-8 font-mono text-xs")} />
      ) : null}
      {message ? <p className="text-xs text-[#b42318]" role={uploadError ? "alert" : undefined}>{message}</p> : description ? <p className="text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      {fileInput}
      {picker}
    </div>
  );
}
