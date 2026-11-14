import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/content/blog";
import { getEvents } from "@/content/events";
import { getProjects } from "@/content/projects";

export const revalidate = 3600;

const staticRoutes = ["", "/about", "/community", "/projects", "/events", "/team", "/blog", "/join", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, { upcoming, past }, posts] = await Promise.all([getProjects(), getEvents(), getPosts()]);
  const abs = (p: string) => `${siteConfig.url}${p}`;

  return [
    ...staticRoutes.map((p) => ({ url: abs(p || "/"), changeFrequency: p === "" ? ("weekly" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.7 })),
    ...projects.map((p) => ({ url: abs(`/projects/${p.slug}`), lastModified: p.publishedAt ?? undefined, priority: 0.6 })),
    ...[...upcoming, ...past].map((e) => ({ url: abs(`/events/${e.slug}`), lastModified: e.startsAt ?? undefined, priority: 0.6 })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updatedAt ?? p.publishedAt, priority: 0.6 })),
  ];
}
