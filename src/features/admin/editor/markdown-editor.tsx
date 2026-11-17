"use client";

import {
  Bold,
  CheckSquare,
  Code,
  Columns2,
  Eye,
  FileCode2,
  Heading2,
  Heading3,
  HelpCircle,
  ImagePlus,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  PenLine,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/admin-ui/overlay";
import { readingMinutes, wordCount } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { ACCEPT_ATTR, useUpload } from "../media/use-upload";

const Preview = dynamic(() => import("./markdown-preview"), {
  ssr: false,
  loading: () => (
    <p className="flex items-center gap-2 text-[0.8125rem] text-zinc-500">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Loading preview…
    </p>
  ),
});

type Edit = { text: string; select?: [number, number] };
type Action = { id: string; label: string; icon: React.ReactNode; shortcut?: string; group: number; run: (sel: string) => Edit; block?: boolean };

const wrap = (before: string, after: string, fallback: string) => (sel: string): Edit => {
  const body = sel || fallback;
  return { text: `${before}${body}${after}`, select: [before.length, before.length + body.length] };
};
const lines = (prefix: (i: number) => string, fallback: string) => (sel: string): Edit => ({ text: (sel || fallback).split("\n").map((l, i) => `${prefix(i)}${l}`).join("\n") });

const ACTIONS: Action[] = [
  { id: "h2", group: 0, label: "Heading", icon: <Heading2 />, block: true, run: (s) => ({ text: `## ${s || "Section heading"}`, select: [3, 3 + (s || "Section heading").length] }) },
  { id: "h3", group: 0, label: "Subheading", icon: <Heading3 />, block: true, run: (s) => ({ text: `### ${s || "Subheading"}`, select: [4, 4 + (s || "Subheading").length] }) },
  { id: "bold", group: 1, label: "Bold", shortcut: "b", icon: <Bold />, run: wrap("**", "**", "bold text") },
  { id: "italic", group: 1, label: "Italic", shortcut: "i", icon: <Italic />, run: wrap("_", "_", "italic text") },
  { id: "strike", group: 1, label: "Strikethrough", icon: <Strikethrough />, run: wrap("~~", "~~", "struck text") },
  { id: "code", group: 1, label: "Inline code", shortcut: "e", icon: <Code />, run: wrap("`", "`", "code") },
  { id: "link", group: 1, label: "Link", shortcut: "k", icon: <Link2 />, run: (s) => { const t = s || "link text"; return { text: `[${t}](https://)`, select: [t.length + 3, t.length + 11] }; } },
  { id: "ul", group: 2, label: "Bulleted list", icon: <List />, block: true, run: lines(() => "- ", "List item") },
  { id: "ol", group: 2, label: "Numbered list", icon: <ListOrdered />, block: true, run: lines((i) => `${i + 1}. `, "List item") },
  { id: "task", group: 2, label: "Checklist", icon: <CheckSquare />, block: true, run: lines(() => "- [ ] ", "Task") },
  { id: "quote", group: 3, label: "Quote", icon: <Quote />, block: true, run: lines(() => "> ", "Quote") },
  { id: "callout", group: 3, label: "Callout", icon: <Info />, block: true, run: (s) => ({ text: `> [!NOTE]\n> ${s || "Something worth highlighting."}` }) },
  { id: "codeblock", group: 3, label: "Code block", icon: <FileCode2 />, block: true, run: (s) => ({ text: "```ts\n" + (s || "const hello = \"Trojans PK\";") + "\n```", select: [3, 5] }) },
  { id: "table", group: 3, label: "Table", icon: <Table />, block: true, run: () => ({ text: "| Column | Column |\n| --- | --- |\n| Cell | Cell |" }) },
  { id: "hr", group: 3, label: "Divider", icon: <Minus />, block: true, run: () => ({ text: "---" }) },
];

const CHEATSHEET: [string, string][] = [
  ["## Heading / ### Subheading", "Section headings (appear in “On this page”)"],
  ["**bold**  _italic_  ~~struck~~", "Emphasis"],
  ["[text](https://…)", "Link"],
  ["![Alt text](url \"Caption\")", "Image with optional caption (or paste / drop an image)"],
  ["- item  /  1. item  /  - [ ] task", "Lists and checklists"],
  ["> quote", "Pull quote"],
  ["> [!NOTE]  [!TIP]  [!IMPORTANT]  [!WARNING]  [!CAUTION]", "Callout box (first line of a quote)"],
  ["`code`  and  ```ts … ```", "Inline code and highlighted code blocks"],
  ["| a | b |\\n| --- | --- |", "Table"],
  ["Text[^1]  …  [^1]: Note", "Footnote"],
  ["---", "Divider"],
];

type Mode = "write" | "split" | "preview";

/**
 * Markdown editor for articles and long text. Toolbar + shortcuts, Write / Split / Preview,
 * full-screen focus mode, and image upload by button, paste or drag and drop (uploads go to
 * the media library and are inserted as Markdown). The preview uses the public renderer.
 */
export function MarkdownEditor({ id, name, defaultValue, required, invalid, describedBy, onChange, folder = "blog" }: { id: string; name: string; defaultValue: string; required?: boolean; invalid?: boolean; describedBy?: string; onChange?: () => void; folder?: string }) {
  const [text, setText] = useState(defaultValue);
  const [mode, setMode] = useState<Mode>("write");
  const [full, setFull] = useState(false);
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, status, progress, error: uploadError } = useUpload(folder);

  const update = useCallback(
    (next: string | ((t: string) => string)) => {
      setText(next);
      onChange?.();
    },
    [onChange],
  );

  function apply(action: Action) {
    const el = ref.current;
    if (!el) return;
    if (mode === "preview") setMode("write");
    const { selectionStart: a, selectionEnd: b, value } = el;
    const before = value.slice(0, a);
    const lead = action.block && before.length > 0 && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const edit = action.run(value.slice(a, b));
    const insert = `${lead}${edit.text}`;
    update(before + insert + value.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      const start = a + lead.length + (edit.select?.[0] ?? edit.text.length);
      const end = a + lead.length + (edit.select?.[1] ?? edit.text.length);
      el.setSelectionRange(start, end);
    });
  }

  /** Insert at the cursor on its own line. */
  function insertBlock(snippet: string) {
    const el = ref.current;
    const pos = el?.selectionStart ?? text.length;
    const before = text.slice(0, pos);
    const lead = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    update(before + lead + snippet + "\n" + text.slice(pos));
  }

  async function uploadFiles(files: FileList | File[] | null | undefined) {
    const list = [...(files ?? [])].filter((f) => f.type.startsWith("image/")).slice(0, 10);
    for (const file of list) {
      const token = `![Uploading ${file.name.replace(/[[\]]/g, "")}…]()`;
      insertBlock(token);
      const asset = await upload(file);
      const alt = (asset?.alt || file.name.replace(/\.[^.]+$/, "")).replace(/[[\]]/g, "");
      update((t) => t.replace(token, asset ? `![${alt}](${asset.url})` : ""));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  // Esc leaves full screen.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full]);

  // In split view, scroll the preview with the source.
  const syncScroll = () => {
    const a = ref.current;
    const b = previewRef.current;
    if (!a || !b || mode !== "split") return;
    const p = a.scrollTop / Math.max(1, a.scrollHeight - a.clientHeight);
    b.scrollTop = p * (b.scrollHeight - b.clientHeight);
  };

  const words = wordCount(text);
  const height = full ? "h-full" : "h-[34rem]";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border bg-white shadow-[0_1px_2px_rgb(16_24_40/0.05)]",
        full ? "admin-scope fixed inset-0 z-50 rounded-none border-0" : "rounded-lg",
        invalid ? "border-red-500" : "border-zinc-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15",
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <div role="toolbar" aria-label="Formatting" aria-controls={id} className="flex min-w-0 flex-wrap items-center">
          {ACTIONS.map((a, i) => (
            <span key={a.id} className="contents">
              {i > 0 && ACTIONS[i - 1].group !== a.group ? <span className="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" /> : null}
              <button
                type="button"
                onClick={() => apply(a)}
                title={a.shortcut ? `${a.label} (Ctrl ${a.shortcut.toUpperCase()})` : a.label}
                aria-label={a.label}
                className="grid size-8 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-[0_1px_2px_rgb(16_24_40/0.08)] [&_svg]:size-4"
              >
                {a.icon}
              </button>
            </span>
          ))}
          <span className="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={status === "uploading"} title="Insert image (or paste / drop one)" aria-label="Insert image" className="grid size-8 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-[0_1px_2px_rgb(16_24_40/0.08)] disabled:opacity-60 [&_svg]:size-4">
            {status === "uploading" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus />}
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void uploadFiles(e.target.files)} />
        </div>

        <div className="flex items-center gap-1.5">
          <div role="tablist" aria-label="Editor view" className="flex rounded-lg bg-zinc-200/60 p-0.5 text-xs">
            {([
              ["write", "Write", <PenLine key="w" />],
              ["split", "Split", <Columns2 key="s" />],
              ["preview", "Preview", <Eye key="p" />],
            ] as const).map(([m, label, icon]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 transition-all [&_svg]:size-3.5", m === "split" && "hidden md:inline-flex", mode === m ? "bg-white font-[600] text-zinc-950 shadow-[0_1px_2px_rgb(16_24_40/0.08)]" : "text-zinc-600 hover:text-zinc-950")}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setHelp(true)} className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-white hover:text-zinc-900" aria-label="Markdown cheat sheet" title="Markdown cheat sheet">
            <HelpCircle className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setFull((f) => !f)} className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-white hover:text-zinc-900" aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen (Esc)" : "Full screen"}>
            {full ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn("relative grid min-h-0 flex-1", mode === "split" && "md:grid-cols-2")}>
        <textarea
          ref={ref}
          id={id}
          name={name}
          value={text}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          spellCheck
          onScroll={syncScroll}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const a = ACTIONS.find((x) => x.shortcut === e.key.toLowerCase());
            if (a) {
              e.preventDefault();
              apply(a);
            }
          }}
          onPaste={(e) => {
            if (e.clipboardData.files.length) {
              e.preventDefault();
              void uploadFiles(e.clipboardData.files);
            }
          }}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (!e.dataTransfer.files.length) return;
            e.preventDefault();
            setDragging(false);
            void uploadFiles(e.dataTransfer.files);
          }}
          placeholder={"Start writing…\n\n## A section heading\n\nParagraphs, **bold**, lists, > [!TIP] callouts, ```code``` and images. Paste or drop an image to upload it."}
          className={cn(
            "block w-full resize-none bg-white px-5 py-4 font-mono text-[0.8125rem] leading-[1.75] text-zinc-900 outline-none placeholder:text-zinc-400",
            height,
            mode === "preview" && "hidden",
            mode === "split" && "md:border-r md:border-zinc-200",
            full && "mx-auto max-w-4xl px-8 text-[0.875rem]",
          )}
        />
        {mode !== "write" ? (
          <div ref={previewRef} className={cn("overflow-y-auto bg-white px-6 py-5", height, mode === "split" && "hidden md:block")} aria-label="Preview">
            <div className={cn(full && mode === "preview" && "mx-auto max-w-3xl")}>
              <Preview text={text} />
            </div>
          </div>
        ) : null}
        {dragging ? (
          <div className="pointer-events-none absolute inset-2 grid place-items-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-50/80 text-sm font-[600] text-blue-700">Drop images to upload and insert</div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500">
        <span>
          {status === "uploading" ? (
            <span className="inline-flex items-center gap-1.5 text-blue-700"><Loader2 className="size-3 animate-spin" aria-hidden="true" />Uploading image… {progress}%</span>
          ) : uploadError ? (
            <span className="text-red-700" role="alert">{uploadError}</span>
          ) : (
            "Markdown · paste or drop images to upload"
          )}
        </span>
        <span className="tabular-nums">
          {words.toLocaleString()} words · {readingMinutes(text)} min read
        </span>
      </div>

      <Dialog open={help} onOpenChange={setHelp} title="Markdown cheat sheet" description="Everything the article renderer supports." size="lg">
        <table className="w-full text-[0.8125rem]">
          <tbody className="divide-y divide-zinc-100">
            {CHEATSHEET.map(([code, what]) => (
              <tr key={code}>
                <td className="px-5 py-2.5 align-top"><code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">{code.replace("\\n", "  ")}</code></td>
                <td className="px-5 py-2.5 text-zinc-600">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Dialog>
    </div>
  );
}
