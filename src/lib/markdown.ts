import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Shared Markdown helpers for the public article renderer, the table of contents and the
 * admin preview. Heading ids and the table of contents come from the same function on the
 * same syntax tree, so every "On this page" link always points at a real heading.
 */

type MdNode = { type: string; value?: string; depth?: number; children?: MdNode[]; data?: { hProperties?: Record<string, unknown> } };

export type TocItem = { id: string; text: string; depth: 2 | 3 };

/** Visible text of a node (links, emphasis and inline code flattened). */
function textOf(node: MdNode): string {
  if (typeof node.value === "string" && (node.type === "text" || node.type === "inlineCode")) return node.value;
  return (node.children ?? []).map(textOf).join("");
}

/** GitHub-style slug: lowercase, punctuation removed, spaces to hyphens. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "section"
  );
}

function walk(node: MdNode, visit: (n: MdNode) => void) {
  visit(node);
  node.children?.forEach((c) => walk(c, visit));
}

/** Give h2–h4 stable, unique ids and return the h2/h3 outline. */
function assignHeadingIds(tree: MdNode): TocItem[] {
  const seen = new Map<string, number>();
  const toc: TocItem[] = [];
  walk(tree, (n) => {
    if (n.type !== "heading" || !n.depth || n.depth < 2 || n.depth > 4) return;
    const text = textOf(n).trim();
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count ? `${base}-${count}` : base;
    n.data = { ...n.data, hProperties: { ...n.data?.hProperties, id } };
    if (n.depth <= 3) toc.push({ id, text, depth: n.depth as 2 | 3 });
  });
  return toc;
}

/** remark plugin: heading ids (see assignHeadingIds). */
export function remarkHeadingIds() {
  return (tree: MdNode) => {
    assignHeadingIds(tree);
  };
}

export const CALLOUTS = ["note", "tip", "important", "warning", "caution"] as const;
export type CalloutType = (typeof CALLOUTS)[number];
const CALLOUT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i;

/** remark plugin: GitHub alert syntax, `> [!NOTE]` … becomes a callout box. */
export function remarkCallouts() {
  return (tree: MdNode) => {
    walk(tree, (n) => {
      if (n.type !== "blockquote") return;
      const first = n.children?.[0];
      const text = first?.type === "paragraph" ? first.children?.[0] : undefined;
      if (!text || text.type !== "text" || typeof text.value !== "string") return;
      const m = CALLOUT_RE.exec(text.value);
      if (!m) return;
      text.value = text.value.slice(m[0].length);
      // Drop an empty leading line break left by "> [!NOTE]" on its own line.
      if (!text.value && first?.children?.[1]?.type === "break") first.children.splice(1, 1);
      n.data = { ...n.data, hProperties: { ...n.data?.hProperties, "data-callout": m[1].toLowerCase() } };
    });
  };
}

/** "On this page" outline (h2 and h3). */
export function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as unknown as MdNode;
  return assignHeadingIds(tree);
}

/** Words of prose, ignoring code blocks, URLs and markdown punctuation. */
export function wordCount(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ");
  return prose.split(/\s+/).filter(Boolean).length;
}

/** Minutes at 220 words per minute, at least 1. */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(wordCount(markdown) / 220));
}
