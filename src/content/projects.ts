import { PROJECT_CATEGORIES, type Project } from "@/types/content";
import { allProjects } from "./validated";
import { isVisible } from "./visibility";

/** Project read API. Data comes from src/data/projects.ts, validated at build time. */
function byNewest(a: Project, b: Project) {
  return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title);
}

export async function getProjects(): Promise<Project[]> {
  return allProjects.filter((p) => isVisible(p.published)).sort(byNewest);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.isFeatured).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProjects(project: Project, limit = 2): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.slug !== project.slug && p.categorySlug === project.categorySlug).slice(0, limit);
}

export function getCategoryName(slug: Project["categorySlug"]): string {
  return PROJECT_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Other";
}
