import type { Metadata } from "next";
import { ArrowUpRight, Rss } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/common/container";
import { Cover } from "@/components/common/cover";
import { JsonLd } from "@/components/common/json-ld";
import { Reveal } from "@/components/common/reveal";
import { Section } from "@/components/common/section";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/content/blog";
import { BlogExplorer } from "@/features/blog/blog-explorer";
import { blogCategoryName } from "@/features/blog/post-card";
import { formatDate } from "@/lib/format";
import { readingMinutes } from "@/lib/markdown";
import type { BlogPost } from "@/types/content";

const DESCRIPTION = "Engineering write-ups, tutorials, hackathon stories and announcements from the Trojans PK developer community in Pakistan.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: { canonical: "/blog", types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${siteConfig.name} blog` }] } },
  openGraph: { title: `Blog | ${siteConfig.name}`, description: DESCRIPTION, url: "/blog", type: "website" },
};

function FeaturedPost({ post }: { post: BlogPost }) {
  const category = blogCategoryName(post.categorySlug);
  return (
    <article className="group relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="lg:col-span-7">
        <Cover src={post.coverImage} title={post.title} label={category} priority sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[16/10] rounded-3xl" />
      </div>
      <div className="lg:col-span-5">
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-0.5 text-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            {post.featured ? "Featured" : "Latest"}
          </span>
          <span>{category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
        </p>
        <h2 className="mt-5 text-balance text-3xl leading-[1.05] font-medium tracking-tighter sm:text-5xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring">
            <span className="link-underline">{post.title}</span>
          </Link>
        </h2>
        <p className="mt-5 text-lg leading-snug text-muted-foreground">{post.excerpt}</p>
        <p className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="text-foreground">{post.authorName}</span>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes(post.content)} min read</span>
          <ArrowUpRight className="ml-auto size-5 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </p>
      </div>
    </article>
  );
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0] ?? null;
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  const url = `${siteConfig.url}/blog`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              "@id": `${url}#blog`,
              name: `${siteConfig.name} Blog`,
              description: DESCRIPTION,
              url,
              inLanguage: "en",
              publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url, logo: { "@type": "ImageObject", url: `${siteConfig.url}/brand/mark.png` } },
              blogPost: posts.slice(0, 20).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${url}/${p.slug}`, datePublished: p.publishedAt.toISOString(), author: { "@type": "Person", name: p.authorName } })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Blog", item: url },
              ],
            },
          ],
        }}
      />

      <header className="bg-wash relative -mt-[var(--nav-h)] border-b border-border">
        <Container className="pt-[calc(var(--nav-h)+4rem)] pb-14 sm:pt-[calc(var(--nav-h)+6rem)] sm:pb-20">
          <Reveal immediate>
            <p className="text-sm text-muted-foreground">Blog</p>
          </Reveal>
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal immediate delay={0.1} className="lg:col-span-8">
              <h1 className="text-balance text-5xl leading-[0.98] font-medium tracking-tighter sm:text-7xl">Notes from the community.</h1>
            </Reveal>
            <Reveal immediate delay={0.2} className="lg:col-span-4">
              <p className="text-lg leading-snug text-muted-foreground">Software engineering, AI, open source, hackathon stories and tutorials, written by members.</p>
              <a href="/blog/rss.xml" className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Rss className="size-4" aria-hidden="true" />
                Subscribe via RSS
              </a>
            </Reveal>
          </div>
        </Container>
      </header>

      {featured ? (
        <Section bordered={false} className="pb-0">
          <FeaturedPost post={featured} />
        </Section>
      ) : null}

      <Section bordered={false}>
        <Suspense>
          <BlogExplorer posts={rest} allPosts={posts} />
        </Suspense>
      </Section>
    </>
  );
}
