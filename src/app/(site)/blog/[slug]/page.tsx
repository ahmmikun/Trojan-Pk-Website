import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/common/chip";
import { Container } from "@/components/common/container";
import { DetailHeader } from "@/components/common/detail-header";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
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
      <DetailHeader
        narrow
        back={{ href: "/blog", label: "All articles" }}
        meta={
          <>
            <span>{category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(post.content)} min read</span>
          </>
        }
        title={post.title}
        summary={post.excerpt}
        cover={post.coverImage ? { src: post.coverImage, title: post.title } : undefined}
      >
        <p className="mt-6 text-sm text-muted-foreground">
          By{" "}
          <span className="text-foreground">
            {author ? <Link href={`/team#${author.slug}`} className="link-underline">{post.authorName}</Link> : post.authorName}
          </span>
        </p>
      </DetailHeader>

      <Container size="narrow" className="py-20 sm:py-24">
        <Markdown className="text-lg leading-[1.65]">{post.content}</Markdown>
        {post.tags.length > 0 ? (
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t}><Chip>{t}</Chip></li>
            ))}
          </ul>
        ) : null}
        <div className="mt-12 border-t border-border pt-8"><ShareLinks url={url} title={post.title} /></div>

        <aside aria-label="About the author" className="mt-12 flex gap-5 border-t border-border pt-8">
          <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-2 text-base font-medium tracking-tight text-muted-foreground">
            {initials(post.authorName)}
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Written by</p>
            <p className="mt-1 text-xl font-medium tracking-tight">{post.authorName}</p>
            <p className="mt-2 text-base leading-snug text-muted-foreground">{author ? `${author.role}. ${author.bio}` : "Trojans PK community member."}</p>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Keep reading" title="Related articles" />
          <Stagger className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <StaggerItem key={p.slug}><PostCard post={p} /></StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  );
}
