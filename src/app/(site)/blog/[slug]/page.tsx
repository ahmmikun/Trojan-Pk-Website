import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/common/chip";
import { Container } from "@/components/common/container";
import { Cover } from "@/components/common/cover";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
import { siteConfig } from "@/config/site";
import { getPostBySlug, getPosts, getRelatedPosts } from "@/content/blog";
import { getTeamMemberBySlug } from "@/content/team";
import { PostCard, blogCategoryName } from "@/features/blog/post-card";
import { ShareLinks } from "@/features/blog/share-links";
import { formatDate, initials, readingTime } from "@/lib/format";

// Known slugs are prerendered at build time. Others render on demand; notFound() handles unknown ones.
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.authorName }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.authorName],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const [related, author] = await Promise.all([
    getRelatedPosts(post),
    post.authorSlug ? getTeamMemberBySlug(post.authorSlug) : Promise.resolve(null),
  ]);
  const category = blogCategoryName(post.categorySlug);
  const url = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt.toISOString(),
          dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
          author: { "@type": "Person", name: post.authorName },
          publisher: { "@type": "Organization", name: siteConfig.name },
          mainEntityOfPage: url,
          ...(post.coverImage ? { image: `${siteConfig.url}${post.coverImage}` } : {}),
        }}
      />
      <Container size="narrow" className="pt-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> All articles
        </Link>
      </Container>

      <Container size="narrow" className="py-10">
        <Chip tone="accent">{category}</Chip>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {author ? <Link href={`/team#${author.slug}`} className="hover:underline">{post.authorName}</Link> : post.authorName}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </p>
      </Container>

      {post.coverImage ? (
        <Container>
          <Cover src={post.coverImage} title={post.title} priority sizes="(min-width: 1152px) 1100px, 100vw" className="rounded-lg border border-border sm:aspect-[21/9]" />
        </Container>
      ) : null}

      <Container size="narrow" className="py-12">
        <Markdown>{post.content}</Markdown>
        {post.tags.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t}><Chip>{t}</Chip></li>
            ))}
          </ul>
        ) : null}
        <div className="mt-10 border-t border-border pt-8"><ShareLinks url={url} title={post.title} /></div>

        <aside aria-label="About the author" className="mt-10 flex gap-4 rounded-lg border border-border bg-surface p-5">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm text-muted-foreground">
            {initials(post.authorName)}
          </span>
          <div>
            <p className="font-medium">{post.authorName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{author ? `${author.role}. ${author.bio}` : "Trojans PK community member."}</p>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <Section className="bg-surface">
          <SectionHeading eyebrow="Keep reading" title="Related articles" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}><PostCard post={p} /></li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
