import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/features/admin/auth";
import { ItemEditor } from "@/features/admin/editor/item-editor";
import { getResource } from "@/features/admin/resources";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/new">): Promise<Metadata> {
  const r = getResource((await params).resource);
  return { title: r ? `New ${r.singular.toLowerCase()}` : "Not found" };
}

/** Sensible starting values. Content that needs review starts as a draft; lists that are usually live start published. */
const DEFAULTS: Record<string, Record<string, unknown>> = {
  events: { type: "MEETUP", status: "UPCOMING", published: false },
  projects: { category_slug: "other", published: false },
  blog: { category_slug: "announcements", author_name: "Trojans PK", published: false },
  achievements: { published: false },
  testimonials: { published: false },
  team: { published: true },
  partners: { published: true },
  stats: { published: true },
  social: { platform: "website", published: true },
};

export default async function NewItemPage({ params }: PageProps<"/admin/[resource]/new">) {
  const resource = getResource((await params).resource);
  if (!resource) notFound();
  await requireAdmin();
  return <ItemEditor resourceKey={resource.key} id={null} values={{ sort_order: 0, ...DEFAULTS[resource.key] }} siteUrl={siteConfig.url} />;
}
