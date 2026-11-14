import Link from "next/link";
import { Cover } from "@/components/common/cover";
import { formatDate, readingTime } from "@/lib/format";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/content";

export const blogCategoryName = (slug: BlogPost["categorySlug"]) => BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Article";

/** Editorial article tile: cover, then category and date, title, excerpt. */
export function PostCard({ post }: { post: BlogPost }) {
  const category = blogCategoryName(post.categorySlug);
  return (
    <article className="group relative flex h-full flex-col">
      <Cover src={post.coverImage} title={post.title} label={category} className="rounded-2xl" />
      <div className="flex flex-1 flex-col pt-5">
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span>{category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </p>
        <h3 className="mt-2 text-2xl font-medium tracking-tight">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring">
            <span className="link-underline">{post.title}</span>
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-base leading-snug text-muted-foreground">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted-foreground">By <span className="text-foreground">{post.authorName}</span></p>
      </div>
    </article>
  );
}
