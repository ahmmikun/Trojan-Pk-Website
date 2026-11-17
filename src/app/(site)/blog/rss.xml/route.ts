import { siteConfig } from "@/config/site";
import { getPosts } from "@/content/blog";
import { blogCategoryName } from "@/features/blog/post-card";

/** RSS 2.0 feed of published articles (newest 50). Linked from the blog pages' <head>. */
export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const posts = (await getPosts()).filter((p) => !p.seo?.noindex).slice(0, 50);
  const site = siteConfig.url;
  const items = posts
    .map((p) => {
      const url = `${site}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.seo?.description ?? p.excerpt)}</description>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      <dc:creator>${esc(p.authorName)}</dc:creator>
      <category>${esc(blogCategoryName(p.categorySlug))}</category>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(siteConfig.name)} Blog</title>
    <link>${site}/blog</link>
    <description>${esc("Engineering write-ups, tutorials, hackathon stories and announcements from the Trojans PK community.")}</description>
    <language>en</language>
    <atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${(posts[0].modifiedAt ?? posts[0].publishedAt).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
