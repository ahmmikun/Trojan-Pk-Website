"use client";

import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { useRef, useState } from "react";
import { Markdown } from "@/components/common/markdown";
import { controlClass } from "@/components/admin-ui/field";
import { cn } from "@/lib/utils";

type Action = { label: string; icon: React.ReactNode; apply: (sel: string) => { text: string; cursor?: number }; block?: boolean; shortcut?: string };

const ACTIONS: Action[] = [
  { label: "Heading", icon: <Heading2 />, block: true, apply: (s) => ({ text: `## ${s || "Heading"}` }) },
  { label: "Bold", shortcut: "b", icon: <Bold />, apply: (s) => ({ text: `**${s || "bold text"}**` }) },
  { label: "Italic", shortcut: "i", icon: <Italic />, apply: (s) => ({ text: `_${s || "italic text"}_` }) },
  { label: "Link", shortcut: "k", icon: <Link2 />, apply: (s) => ({ text: `[${s || "link text"}](https://)`, cursor: -1 }) },
  { label: "Bulleted list", icon: <List />, block: true, apply: (s) => ({ text: (s || "Item").split("\n").map((l) => `- ${l}`).join("\n") }) },
  { label: "Numbered list", icon: <ListOrdered />, block: true, apply: (s) => ({ text: (s || "Item").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") }) },
  { label: "Quote", icon: <Quote />, block: true, apply: (s) => ({ text: (s || "Quote").split("\n").map((l) => `> ${l}`).join("\n") }) },
  { label: "Code", icon: <Code />, apply: (s) => ({ text: s.includes("\n") ? `\`\`\`\n${s}\n\`\`\`` : `\`${s || "code"}\`` }) },
];

function words(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Markdown editor: toolbar + shortcuts (Ctrl B / I / K), Write and Preview tabs. The
 * preview uses the same <Markdown> component as the public site, so what you see is
 * what visitors get. Raw HTML is never rendered.
 */
export function MarkdownEditor({ id, name, defaultValue, required, invalid, describedBy, onChange }: { id: string; name: string; defaultValue: string; required?: boolean; invalid?: boolean; describedBy?: string; onChange?: () => void }) {
  const [text, setText] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  function run(action: Action) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const before = value.slice(0, a);
    const needsBreak = action.block && before.length > 0 && !before.endsWith("\n");
    const { text: inserted, cursor } = action.apply(value.slice(a, b));
    const insert = `${needsBreak ? "\n" : ""}${inserted}`;
    const next = before + insert + value.slice(b);
    setText(next);
    onChange?.();
    requestAnimationFrame(() => {
      el.focus();
      const pos = a + insert.length + (cursor ?? 0);
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15", invalid ? "border-[#d92d20]" : "border-input")}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-1.5 py-1">
        <div role="toolbar" aria-label="Formatting" aria-controls={id} className={cn("-mx-0.5 flex min-w-0 items-center gap-px overflow-x-auto px-0.5", mode === "preview" && "invisible")}>
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => run(a)}
              title={a.shortcut ? `${a.label} (Ctrl ${a.shortcut.toUpperCase()})` : a.label}
              aria-label={a.label}
              className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground [&_svg]:size-3.5"
            >
              {a.icon}
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Editor mode" className="flex shrink-0 rounded-md bg-foreground/[0.05] p-0.5 text-xs">
          {(["write", "preview"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("rounded px-2.5 py-1 capitalize transition-colors", mode === m ? "bg-background font-medium text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={text}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => (setText(e.target.value), onChange?.())}
        onKeyDown={(e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          const a = ACTIONS.find((x) => x.shortcut === e.key.toLowerCase());
          if (a) {
            e.preventDefault();
            run(a);
          }
        }}
        rows={14}
        spellCheck
        className={cn(controlClass, "min-h-72 resize-y rounded-none border-0 font-mono text-[0.8125rem] leading-relaxed shadow-none focus-visible:ring-0", mode === "preview" && "hidden")}
      />
      {mode === "preview" ? (
        <div className="min-h-72 px-5 py-4">{text.trim() ? <Markdown className="text-[0.9375rem] leading-7">{text}</Markdown> : <p className="text-[0.8125rem] text-muted-foreground">Nothing to preview yet.</p>}</div>
      ) : null}
      <div className="flex justify-between border-t border-border px-3 py-1.5 text-[0.6875rem] text-muted-foreground">
        <span>Markdown supported</span>
        <span className="tabular-nums">{words(text)} words · {Math.max(1, Math.round(words(text) / 220))} min read</span>
      </div>
    </div>
  );
}
