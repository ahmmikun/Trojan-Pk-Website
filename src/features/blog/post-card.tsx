import Link from "next/link";
import { Chip } from "@/components/common/chip";
import { Cover } from "@/components/common/cover";
import { formatDate, readingTime } from "@/lib/format";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/content";

export const blogCategoryName = (slug: BlogPost["categorySlug"]) => BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Article";

export function PostCard({ post }: { post: BlogPost }) {
  const category = blogCategoryName(post.categorySlug);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-white/20 hover:bg-surface-2">
      <Cover src={post.coverImage} title={post.title} label={category} className="border-b border-border" />
      <div className="flex flex-1 flex-col p-5">
        <Chip className="self-start">{category}</Chip>
        <h3 className="mt-4 text-lg font-medium tracking-tight">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <p className="mt-5 flex flex-wrap items-center gap-x-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>{post.authorName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </p>
      </div>
    </article>
  );
}
