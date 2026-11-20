import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/content/blog";
import { getEvents } from "@/content/events";
import { getProjects } from "@/content/projects";

export const revalidate = 3600;

const staticRoutes = ["", "/about", "/contact", "/community", "/projects", "/events", "/team", "/blog", "/join", "/privacy", "/terms"];

/**
 * Only indexable pages: sample content and items marked "Hide from search engines" in
 * /admin are left out. `lastModified` is the real last edit (database `updated_at`) when known.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, { upcoming, past }, posts] = await Promise.all([getProjects(), getEvents(), getPosts()]);
  const abs = (p: string) => `${siteConfig.url}${p}`;
  const events = [...upcoming, ...past].filter((e) => !e.isSample && !e.seo?.noindex);

  return [
    ...staticRoutes.map((p) => ({ url: abs(p || "/"), changeFrequency: p === "" ? ("weekly" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.7 })),
    ...projects.filter((p) => !p.seo?.noindex).map((p) => ({ url: abs(`/projects/${p.slug}`), lastModified: p.modifiedAt ?? p.publishedAt ?? undefined, priority: 0.6 })),
    ...events.map((e) => ({ url: abs(`/events/${e.slug}`), lastModified: e.modifiedAt ?? e.startsAt ?? undefined, priority: 0.6 })),
    ...posts.filter((p) => !p.seo?.noindex).map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.modifiedAt ?? p.updatedAt ?? p.publishedAt, priority: 0.6 })),
  ];
}
