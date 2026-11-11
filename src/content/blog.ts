import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/content";
import { blogFrontMatterSchema } from "./schemas";
import { allTeam, ContentError } from "./validated";
import { showDrafts } from "./visibility";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function readPosts(): Promise<BlogPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(BLOG_DIR);
  } catch {
    return []; // no content/blog folder yet
  }

  const posts: BlogPost[] = [];
  for (const file of files) {
    // Files starting with "_" (e.g. _template.md) are templates/notes, not posts.
    if (!file.endsWith(".md") || file.startsWith("_")) continue;

    const slug = file.slice(0, -3);
    const where = `content/blog/${file}`;
    if (!SLUG_RE.test(slug)) {
      throw new ContentError(`${where}: the file name becomes the URL, so it must be lowercase letters, numbers and hyphens (e.g. "my-first-post.md").`);
    }

    const { data, content } = matter(await fs.readFile(path.join(BLOG_DIR, file), "utf8"));
    const parsed = blogFrontMatterSchema.safeParse(data);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(front matter)"}: ${i.message}`).join("\n");
      throw new ContentError(`Invalid front matter in ${where}:\n${detail}`);
    }
    const fm = parsed.data;

    if (fm.draft && !showDrafts) continue;
    if (fm.authorSlug && !allTeam.some((m) => m.slug === fm.authorSlug)) {
      throw new ContentError(`${where}: authorSlug "${fm.authorSlug}" does not match any team member in src/data/team.ts.`);
    }
    if (!content.trim()) throw new ContentError(`${where}: the article body is empty.`);

    posts.push({
      slug,
      title: fm.title,
      excerpt: fm.excerpt,
      content: content.trim(),
      coverImage: fm.cover ?? null,
      categorySlug: fm.category as BlogPost["categorySlug"],
      tags: fm.tags,
      authorName: fm.author,
      authorSlug: fm.authorSlug ?? null,
      publishedAt: fm.date,
      updatedAt: fm.updated ?? null,
      featured: fm.featured,
    });
  }
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

/** Published posts only (drafts appear in `next dev` only), newest first. */
export async function getPosts(): Promise<BlogPost[]> {
  return readPosts();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const posts = (await getPosts()).filter((p) => p.slug !== post.slug);
  const score = (p: BlogPost) => (p.categorySlug === post.categorySlug ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  return posts
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

export function getBlogCategoryName(slug: BlogPost["categorySlug"]): string {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Article";
}
