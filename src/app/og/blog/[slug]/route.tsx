import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getPostBySlug } from "@/content/blog";
import { blogCategoryName } from "@/features/blog/post-card";
import { formatDate } from "@/lib/format";

/**
 * Branded 1200×630 share card for blog posts that have no cover or social image.
 * Linked from the post's Open Graph and JSON-LD metadata only when no image exists.
 */
export const revalidate = 3600;

export async function GET(_req: Request, { params }: RouteContext<"/og/blog/[slug]">) {
  const post = await getPostBySlug((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const title = post.title.length > 110 ? `${post.title.slice(0, 107)}…` : post.title;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#0a0a0b", color: "#f2f2f0", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "radial-gradient(circle at 85% 0%, rgba(74,222,128,0.22), transparent 45%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, letterSpacing: "-0.02em" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#4ade80" }} />
          <span>{siteConfig.name}</span>
          <span style={{ color: "#8e8e93" }}>/ Blog</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <span style={{ fontSize: 26, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.12em" }}>{blogCategoryName(post.categorySlug)}</span>
          <span style={{ fontSize: title.length > 60 ? 64 : 80, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 600 }}>{title}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#a1a1aa", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 28 }}>
          <span>{post.authorName}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
