import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { BlogExplorer } from "@/features/blog/blog-explorer";
import { getPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering write-ups, tutorials, hackathon stories and announcements from the Trojans PK community.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the community."
        description="Software engineering, AI and machine learning, open source, hackathon experiences and tutorials, written by members."
      />
      <Section bordered={false}>
        <BlogExplorer posts={posts} />
      </Section>
    </>
  );
}
