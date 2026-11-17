"use client";

import { Check, Copy, ExternalLink, Images, Loader2, Search, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/admin-ui/button";
import { controlClass, Field, Input } from "@/components/admin-ui/field";
import { EmptyState, formatDate } from "@/components/admin-ui/display";
import { ConfirmDialog, Dialog } from "@/components/admin-ui/overlay";
import { toast } from "@/components/admin-ui/toast";
import { cn } from "@/lib/utils";
import { deleteMedia, getMediaUsage, updateMediaAlt, type MediaUsage } from "../actions";
import { MediaThumb } from "./media-thumb";
import { ACCEPT_ATTR, formatBytes, useUpload, type MediaAsset } from "./use-upload";

/** Uploads several files in sequence with one progress line per file. */
function BulkUploader({ onDone }: { onDone: () => void }) {
  const { upload, progress } = useUpload("library");
  const [queue, setQueue] = useState<{ name: string; state: "waiting" | "uploading" | "done" | "error"; error?: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const running = queue.some((q) => q.state === "uploading" || q.state === "waiting");

  async function run(files: FileList | null) {
    if (!files?.length || running) return;
    const list = [...files].slice(0, 20);
    setQueue(list.map((f) => ({ name: f.name, state: "waiting" })));
    let ok = 0;
    for (const [i, file] of list.entries()) {
      setQueue((q) => q.map((x, j) => (j === i ? { ...x, state: "uploading" } : x)));
      const asset = await upload(file);
      if (asset) ok++;
      setQueue((q) => q.map((x, j) => (j === i ? (asset ? { ...x, state: "done" } : { ...x, state: "error", error: "Failed" }) : x)));
    }
    if (fileRef.current) fileRef.current.value = "";
    if (ok) toast.success(ok === 1 ? "Image uploaded" : `${ok} images uploaded`);
    if (ok < list.length) toast.error(`${list.length - ok} upload${list.length - ok === 1 ? "" : "s"} failed`, "Check the file type (JPEG, PNG, WebP, AVIF) and size (10 MB).");
    onDone();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => (e.preventDefault(), setDragging(false), void run(e.dataTransfer.files))}
        disabled={running}
        className={cn(
          "flex items-center justify-center gap-3 rounded-lg border border-dashed px-5 py-5 text-[0.8125rem] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          dragging ? "border-foreground/40 bg-muted" : "border-input bg-background hover:border-foreground/25 hover:bg-muted/40",
        )}
      >
        <UploadCloud className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>
          <span className="font-medium">Upload images</span>
          <span className="text-muted-foreground"> · click or drop up to 20 files · JPEG, PNG, WebP, AVIF · 10 MB each</span>
        </span>
      </button>
      <input ref={fileRef} type="file" multiple accept={ACCEPT_ATTR} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void run(e.target.files)} />
      {queue.length && running ? (
        <ul className="rounded-lg border border-border bg-background text-[0.8125rem]" aria-live="polite">
          {queue.map((q, i) => (
            <li key={i} className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-0">
              {q.state === "uploading" ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : q.state === "done" ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <span className="size-3.5" />}
              <span className="min-w-0 flex-1 truncate">{q.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{q.state === "uploading" ? `${progress}%` : q.state === "done" ? "Done" : q.state === "error" ? "Failed" : "Waiting"}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MediaDetails({ asset, onClose, onDeleted }: { asset: MediaAsset | null; onClose: () => void; onDeleted: () => void }) {
  if (!asset) return null;
  // Keyed so every image opens with fresh state.
  return <MediaDetailsDialog key={asset.id} asset={asset} onClose={onClose} onDeleted={onDeleted} />;
}

function MediaDetailsDialog({ asset, onClose, onDeleted }: { asset: MediaAsset; onClose: () => void; onDeleted: () => void }) {
  const [alt, setAlt] = useState(asset.alt);
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saving, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    getMediaUsage(asset.url).then((u) => alive && setUsage(u)).catch(() => alive && setUsage([]));
    return () => {
      alive = false;
    };
  }, [asset]);

  const inUse = (usage?.length ?? 0) > 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="lg" title="Image details" description={asset.path.split("/").pop()}>
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
          <MediaThumb src={asset.url} alt={asset.alt} fit="contain" className="max-h-[26rem] w-full bg-transparent" />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <Field label="Alt text" description="Describe the image for screen readers and search engines. Leave empty only if it is decorative.">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} placeholder="e.g. Members presenting at the national finals" />
          </Field>
          <Button
            variant="primary"
            disabled={alt === asset.alt || saving}
            onClick={() =>
              start(async () => {
                const r = await updateMediaAlt(asset.id, alt);
                if (r.ok) {
                  toast.success("Alt text saved");
                  router.refresh();
                } else toast.error("Could not save", r.error);
              })
            }
          >
            {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save alt text
          </Button>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs">
            <dt className="text-muted-foreground">Dimensions</dt>
            <dd className="text-right tabular-nums">{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—"}</dd>
            <dt className="text-muted-foreground">Size</dt>
            <dd className="text-right tabular-nums">{formatBytes(asset.size_bytes) || "—"}</dd>
            <dt className="text-muted-foreground">Type</dt>
            <dd className="text-right">{asset.mime_type?.replace("image/", "").toUpperCase() ?? "—"}</dd>
            <dt className="text-muted-foreground">Uploaded</dt>
            <dd className="text-right tabular-nums">{formatDate(asset.created_at, { time: true })}</dd>
          </dl>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium">Used in</p>
            {usage === null ? (
              <p className="text-xs text-muted-foreground">Checking…</p>
            ) : usage.length ? (
              <ul className="flex flex-col gap-1">
                {usage.map((u) => (
                  <li key={u.href + u.title}>
                    <Link href={u.href} className="flex items-baseline gap-2 text-xs hover:underline">
                      <span className="text-muted-foreground">{u.label}</span>
                      <span className="truncate">{u.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Not used anywhere yet.</p>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(asset.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Copy URL"}
            </Button>
            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[0.8125rem] text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground [&_svg]:size-3.5">
              <ExternalLink aria-hidden="true" />
              Open
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <Button size="sm" variant="danger-ghost" className="ml-auto" disabled={usage === null || inUse} title={inUse ? "Replace it where it is used before deleting" : undefined} onClick={() => setConfirm(true)}>
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </div>
          {inUse ? <p className="-mt-3 text-xs text-muted-foreground">In use, so it cannot be deleted. Replace it in the entries above first.</p> : null}
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this image?"
        description="The file is removed from storage permanently. This cannot be undone."
        onConfirm={async () => {
          const r = await deleteMedia(asset.id);
          if (!r.ok) throw new Error(r.error);
          toast.success("Image deleted");
          onDeleted();
        }}
      />
    </Dialog>
  );
}

export function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [missingAlt, setMissingAlt] = useState(false);
  const [open, setOpen] = useState<MediaAsset | null>(null);
  const shown = assets.filter((a) => (!query || `${a.alt} ${a.path}`.toLowerCase().includes(query.toLowerCase())) && (!missingAlt || !a.alt.trim()));
  const missingCount = assets.filter((a) => !a.alt.trim()).length;

  return (
    <div className="flex flex-col gap-5">
      <BulkUploader onDone={() => router.refresh()} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative sm:w-80">
          <span className="sr-only">Search media</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by alt text or file name" className={cn(controlClass, "h-8 pl-8")} />
        </label>
        <button
          type="button"
          aria-pressed={missingAlt}
          onClick={() => setMissingAlt((m) => !m)}
          className={cn("inline-flex h-8 w-fit items-center gap-1.5 rounded-md border px-2.5 text-[0.8125rem] transition-colors", missingAlt ? "border-foreground/30 bg-foreground/[0.05]" : "border-border hover:bg-muted/60")}
        >
          Missing alt text
          <span className="rounded bg-foreground/[0.07] px-1 text-xs tabular-nums">{missingCount}</span>
        </button>
        <p className="text-xs text-muted-foreground tabular-nums sm:ml-auto">{shown.length} of {assets.length} images</p>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card"><EmptyState icon={<Images />} title="No images yet" description="Upload images here, or from any image field. They all appear in this library." /></div>
      ) : shown.length === 0 ? (
        <p className="py-14 text-center text-[0.8125rem] text-muted-foreground">No images match.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {shown.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => setOpen(a)} className="group block w-full text-left outline-none">
                <span className="block overflow-hidden rounded-lg ring-1 ring-border transition-shadow group-hover:ring-foreground/25 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <MediaThumb src={a.url} className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.02]" />
                </span>
                <span className="mt-1.5 block truncate text-xs">{a.alt.trim() || <span className="text-amber-700">No alt text</span>}</span>
                <span className="block text-[0.6875rem] text-muted-foreground tabular-nums">
                  {a.width && a.height ? `${a.width}×${a.height} · ` : ""}
                  {formatBytes(a.size_bytes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <MediaDetails asset={open} onClose={() => setOpen(null)} onDeleted={() => (setOpen(null), router.refresh())} />
    </div>
  );
}
