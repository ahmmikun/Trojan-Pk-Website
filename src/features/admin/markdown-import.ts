"use server";

import matter from "gray-matter";
import { BLOG_CATEGORIES } from "@/types/content";
import { requireAdmin } from "./auth";

/**
 * Turn an uploaded .md file (YAML front matter + Markdown body) into blog editor values.
 * Accepts the content/blog front matter (title, excerpt, category, tags, author, authorSlug,
 * date, updated, cover, featured, draft) plus common aliases. Nothing is saved here: the
 * values fill the form, and the normal save validates them.
 */

export type ImportResult = { ok: true; values: Record<string, unknown>; notes: string[] } | { ok: false; error: string };

const MAX = 1024 * 1024;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const pick = (d: Record<string, unknown>, ...keys: string[]) => keys.map((k) => d[k]).find((v) => v !== undefined && v !== null && v !== "");
const iso = (v: unknown) => {
  // YAML turns `2026-11-10` into a Date at UTC midnight; treat date-only values as 09:00 Pakistan time that day.
  if (v instanceof Date && !Number.isNaN(v.getTime()) && v.getUTCHours() === 0 && v.getUTCMinutes() === 0 && v.getUTCSeconds() === 0) v = v.toISOString().slice(0, 10);
  const d = v instanceof Date ? v : typeof v === "string" && v ? new Date(v.length === 10 ? `${v}T09:00:00+05:00` : v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
};
const slugify = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export async function parseMarkdownFile(fileName: string, text: string): Promise<ImportResult> {
  await requireAdmin();
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "The file is empty." };
  if (text.length > MAX) return { ok: false, error: "The file is larger than 1 MB." };

  let parsed: { data: Record<string, unknown>; content: string };
  try {
    parsed = matter(text) as unknown as typeof parsed;
  } catch (e) {
    return { ok: false, error: `The front matter could not be read: ${(e as Error).message.split("\n")[0]}` };
  }

  const d = parsed.data ?? {};
  const notes: string[] = [];
  let body = parsed.content.replace(/^\uFEFF/, "").trim();
  let title = str(pick(d, "title", "name"));

  // A leading "# Title" duplicates the page heading: use it as the title, then drop it.
  const h1 = /^#\s+(.+)\n+/.exec(body);
  if (h1) {
    if (!title) title = h1[1].trim();
    if (h1[1].trim() === title) {
      body = body.slice(h1[0].length).trim();
      notes.push("Removed the leading # heading (the title is shown as the page heading).");
    }
  }
  if (!title) {
    title = fileName.replace(/\.(md|markdown)$/i, "").replace(/[-_]+/g, " ").trim();
    notes.push("No title in the file; used the file name.");
  }

  let excerpt = str(pick(d, "excerpt", "description", "summary"));
  if (!excerpt) {
    const para = body.split(/\n{2,}/).find((p) => p.trim() && !/^(#|>|```|!\[|[-*] |\d+\. |\|)/.test(p.trim()));
    excerpt = (para ?? "").replace(/[*_`~[\]]|\(https?:[^)]*\)/g, "").replace(/\s+/g, " ").trim().slice(0, 280);
    if (excerpt) notes.push("No excerpt in the file; used the first paragraph.");
  }

  const rawCategory = str(pick(d, "category", "categories"));
  const category = BLOG_CATEGORIES.find((c) => c.slug === rawCategory || c.name.toLowerCase() === rawCategory.toLowerCase());
  if (rawCategory && !category) notes.push(`Unknown category “${rawCategory}”; pick one before saving.`);

  const tagsRaw = pick(d, "tags", "keywords");
  const tags = (Array.isArray(tagsRaw) ? tagsRaw.map(str) : str(tagsRaw).split(",")).map((t) => t.trim()).filter(Boolean).slice(0, 30);

  const draft = pick(d, "draft");
  const values: Record<string, unknown> = {
    title: title.slice(0, 200),
    slug: slugify(str(pick(d, "slug")) || fileName.replace(/\.(md|markdown)$/i, "") || title),
    excerpt: excerpt.slice(0, 300),
    content: body,
    tags,
    ...(category ? { category_slug: category.slug } : {}),
    ...(str(pick(d, "author")) ? { author_name: str(pick(d, "author")) } : {}),
    ...(str(pick(d, "authorSlug", "author_slug")) ? { author_slug: str(pick(d, "authorSlug", "author_slug")) } : {}),
    ...(iso(pick(d, "date", "publishedAt", "published_at")) ? { published_at: iso(pick(d, "date", "publishedAt", "published_at")) } : {}),
    ...(iso(pick(d, "updated", "updatedAt", "lastmod")) ? { content_updated_at: iso(pick(d, "updated", "updatedAt", "lastmod")) } : {}),
    ...(str(pick(d, "cover", "image", "coverImage")) ? { cover_image: str(pick(d, "cover", "image", "coverImage")) } : {}),
    ...(pick(d, "featured") !== undefined ? { featured: Boolean(pick(d, "featured")) } : {}),
    ...(draft !== undefined ? { published: !draft } : {}),
    ...(str(pick(d, "seoTitle", "seo_title", "metaTitle")) ? { seo_title: str(pick(d, "seoTitle", "seo_title", "metaTitle")).slice(0, 70) } : {}),
    ...(str(pick(d, "seoDescription", "seo_description", "metaDescription")) ? { seo_description: str(pick(d, "seoDescription", "seo_description", "metaDescription")).slice(0, 200) } : {}),
  };
  return { ok: true, values, notes };
}
