"use client";

import { Markdown } from "@/components/common/markdown";

/** Loaded on demand by the editor (next/dynamic), so the highlighter only downloads when a preview opens. */
export default function MarkdownPreview({ text }: { text: string }) {
  return text.trim() ? <Markdown variant="article">{text}</Markdown> : <p className="text-[0.8125rem] text-zinc-500">Nothing to preview yet. Start writing on the left.</p>;
}
