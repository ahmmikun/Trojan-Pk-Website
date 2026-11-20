import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Rss } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/common/chip";
import { Container } from "@/components/common/container";
import { Cover } from "@/components/common/cover";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { siteConfig } from "@/config/site";
import { getPostBySlug, getPosts, getRelatedPosts } from "@/content/blog";
import { getTeamMemberBySlug } from "@/content/team";
import { ArticleToc, ArticleTocMobile, ReadingProgress } from "@/features/blog/article-chrome";
import { PostCard, blogCategoryName } from "@/features/blog/post-card";
import { ShareLinks } from "@/features/blog/share-links";
import { formatDate, initials } from "@/lib/format";
import { extractToc, readingMinutes, wordCount } from "@/lib/markdown";
import { absoluteUrl, detailMetadata } from "@/lib/seo";

// Known slugs are prerendered at build time. Others render on demand; notFound() handles unknown ones.
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  const base = detailMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    // Branded title card when the post has neither a social image nor a cover.
    image: post.coverImage ?? `/og/blog/${post.slug}`,
    seo: post.seo,
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: (post.updatedAt ?? post.modifiedAt ?? post.publishedAt).toISOString(),
      authors: [post.authorName],
      section: blogCategoryName(post.categorySlug),
      tags: post.tags,
    },
  });
  return {
    ...base,
    authors: [{ name: post.authorName, ...(post.authorSlug ? { url: `/team#${post.authorSlug}` } : {}) }],
    keywords: post.tags,
    alternates: { ...base.alternates, types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${siteConfig.name} blog` }] } },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [related, author, all] = await Promise.all([getRelatedPosts(post), post.authorSlug ? getTeamMemberBySlug(post.authorSlug) : Promise.resolve(null), getPosts()]);
  const category = blogCategoryName(post.categorySlug);
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const toc = extractToc(post.content);
  const minutes = readingMinutes(post.content);
  const index = all.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const updated = post.updatedAt && post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? post.updatedAt : null;
  const image = post.seo?.image ?? post.coverImage;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: post.title.slice(0, 110),
              description: post.seo?.description ?? post.excerpt,
              url,
              mainEntityOfPage: { "@type": "WebPage", "@id": url },
              datePublished: post.publishedAt.toISOString(),
              dateModified: (post.updatedAt ?? post.modifiedAt ?? post.publishedAt).toISOString(),
              inLanguage: "en",
              articleSection: category,
              keywords: post.tags.join(", ") || undefined,
              wordCount: wordCount(post.content),
              timeRequired: `PT${minutes}M`,
              image: [absoluteUrl(siteConfig.url, image ?? `/og/blog/${post.slug}`)],
              author: {
                "@type": "Person",
                name: post.authorName,
                ...(author ? { url: `${siteConfig.url}/team#${author.slug}`, jobTitle: author.role } : {}),
              },
              publisher: {
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.url,
                logo: { "@type": "ImageObject", url: `${siteConfig.url}/brand/mark.png` },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />
      <ReadingProgress targetId="article-body" />

      <article>
        <header className="bg-wash relative -mt-[var(--nav-h)] border-b border-border">
          <Container size="narrow" className="pt-[calc(var(--nav-h)+3rem)] pb-12 sm:pt-[calc(var(--nav-h)+4.5rem)] sm:pb-16">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="link-underline hover:text-foreground">Blog</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href={`/blog?category=${post.categorySlug}`} className="link-underline hover:text-foreground">{category}</Link></li>
              </ol>
            </nav>
            <h1 className="mt-6 text-balance text-4xl leading-[1.04] font-medium tracking-tighter sm:text-[3.5rem]">{post.title}</h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl">{post.excerpt}</p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                {author?.photo ? (
                  <Image src={author.photo} alt="" width={44} height={44} sizes="44px" className="size-11 rounded-full object-cover ring-1 ring-border" />
                ) : (
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-surface-2 text-sm font-medium text-muted-foreground ring-1 ring-border">{initials(post.authorName)}</span>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-medium">
                    {author ? <Link href={`/team#${author.slug}`} className="link-underline">{post.authorName}</Link> : post.authorName}
                  </p>
                  {author ? <p className="mt-0.5 text-sm text-muted-foreground">{author.role}</p> : null}
                </div>
              </div>
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="sr-only">Published</dt>
                  <dd><time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time></dd>
                </div>
                {updated ? (
                  <div className="text-muted-foreground">
                    <dt className="inline">Updated </dt>
                    <dd className="inline"><time dateTime={updated.toISOString()}>{formatDate(updated)}</time></dd>
                  </div>
                ) : null}
                <div className="text-muted-foreground">
                  <dt className="sr-only">Reading time</dt>
                  <dd>{minutes} min read</dd>
                </div>
              </dl>
            </div>
          </Container>
          {post.coverImage ? (
            <Container className="max-w-6xl pb-12 sm:pb-16">
              <Cover src={post.coverImage} title={post.title} priority hoverLabel={null} sizes="(min-width: 1152px) 1056px, 100vw" className="aspect-[2/1] rounded-3xl" />
            </Container>
          ) : null}
        </header>

        <Container className="grid gap-12 py-16 sm:py-20 xl:grid-cols-[minmax(0,1fr)_minmax(0,46rem)_minmax(0,1fr)] xl:gap-16">
          <aside className="hidden xl:block">
            <div className="sticky top-[calc(var(--nav-h)+2.5rem)] flex flex-col gap-10">
              <ArticleToc items={toc} />
            </div>
          </aside>

          <div className="min-w-0">
            <ArticleTocMobile items={toc} />
            <div id="article-body">
              <Markdown variant="article">{post.content}</Markdown>
            </div>

            {post.tags.length > 0 ? (
              <ul className="mt-14 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t}><Chip>{t}</Chip></li>
                ))}
              </ul>
            ) : null}

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-border py-6">
              <ShareLinks url={url} title={post.title} />
              <a href="/blog/rss.xml" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Rss className="size-4" aria-hidden="true" />
                RSS feed
              </a>
            </div>

            <aside aria-label="About the author" className="mt-12 flex gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-8">
              {author?.photo ? (
                <Image src={author.photo} alt="" width={64} height={64} sizes="64px" className="size-16 shrink-0 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-surface-2 text-lg font-medium text-muted-foreground">{initials(post.authorName)}</span>
              )}
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Written by</p>
                <p className="mt-1 text-xl font-medium tracking-tight">{post.authorName}</p>
                {author ? <p className="text-sm text-muted-foreground">{author.role}</p> : null}
                <p className="mt-3 text-base leading-snug text-muted-foreground">{author?.bio ?? "Trojans PK community member."}</p>
                {author ? <Link href={`/team#${author.slug}`} className="link-underline mt-4 inline-block text-sm">More about {author.name.split(" ")[0]}</Link> : null}
              </div>
            </aside>

            {newer || older ? (
              <nav aria-label="More articles" className="mt-12 grid gap-4 sm:grid-cols-2">
                {older ? (
                  <Link href={`/blog/${older.slug}`} className="group rounded-2xl border border-border p-5 transition-colors hover:border-foreground/25 hover:bg-surface">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />Previous</span>
                    <span className="mt-2 block text-lg leading-snug font-medium tracking-tight">{older.title}</span>
                  </Link>
                ) : <span className="hidden sm:block" />}
                {newer ? (
                  <Link href={`/blog/${newer.slug}`} className="group rounded-2xl border border-border p-5 text-right transition-colors hover:border-foreground/25 hover:bg-surface">
                    <span className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">Next<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    <span className="mt-2 block text-lg leading-snug font-medium tracking-tight">{newer.title}</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>
          <div className="hidden xl:block" />
        </Container>
      </article>

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
