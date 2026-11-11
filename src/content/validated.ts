import type { z } from "zod";
import { achievementsData } from "@/data/achievements";
import { eventsData } from "@/data/events";
import { projectsData } from "@/data/projects";
import { statsData } from "@/data/stats";
import { teamData } from "@/data/team";
import { testimonialsData } from "@/data/testimonials";
import { socialLinks as socialLinksData } from "@/config/social-links";
import {
  achievementSchema,
  eventSchema,
  projectSchema,
  socialLinkSchema,
  statSchema,
  teamMemberSchema,
  testimonialSchema,
} from "./schemas";

export class ContentError extends Error {
  constructor(message: string) {
    super(`\n[content] ${message}\n`);
    this.name = "ContentError";
  }
}

/** Validate a list of entries and (optionally) require unique keys. Throws a readable error on the first problem. */
export function parseList<S extends z.ZodType>(
  name: string,
  schema: S,
  items: readonly unknown[],
  keyOf?: (item: z.output<S>) => string,
): z.output<S>[] {
  const seen = new Set<string>();
  return items.map((raw, i) => {
    const result = schema.safeParse(raw);
    if (!result.success) {
      const label = (raw as { slug?: string; id?: string; key?: string })?.slug ?? (raw as { id?: string })?.id ?? `#${i}`;
      const detail = result.error.issues.map((is) => `  - ${is.path.join(".") || "(entry)"}: ${is.message}`).join("\n");
      throw new ContentError(`Invalid entry in ${name} (${label}):\n${detail}`);
    }
    if (keyOf) {
      const key = keyOf(result.data);
      if (seen.has(key)) throw new ContentError(`Duplicate "${key}" in ${name}. Each entry must be unique.`);
      seen.add(key);
    }
    return result.data;
  });
}

// Typed to the hand-written content types so the schemas and types cannot drift apart.
export const allProjects = parseList("src/data/projects.ts", projectSchema, projectsData, (p) => p.slug) as typeof projectsData;
export const allEvents = parseList("src/data/events.ts", eventSchema, eventsData, (e) => e.slug) as typeof eventsData;
export const allTeam = parseList("src/data/team.ts", teamMemberSchema, teamData, (m) => m.slug) as typeof teamData;
export const allTestimonials = parseList("src/data/testimonials.ts", testimonialSchema, testimonialsData, (t) => t.id) as typeof testimonialsData;
export const allAchievements = parseList("src/data/achievements.ts", achievementSchema, achievementsData, (a) => a.slug) as typeof achievementsData;
export const allStats = parseList("src/data/stats.ts", statSchema, statsData, (s) => s.key) as typeof statsData;
export const allSocialLinks = parseList("src/config/social-links.ts", socialLinkSchema, socialLinksData, (l) => l.id) as typeof socialLinksData;

// Cross-reference checks: fail the build if content points at something that does not exist.
for (const a of allAchievements) {
  if (a.projectSlug && !allProjects.some((p) => p.slug === a.projectSlug)) {
    throw new ContentError(`Achievement "${a.slug}" references unknown project "${a.projectSlug}" (src/data/projects.ts).`);
  }
  if (a.eventSlug && !allEvents.some((e) => e.slug === a.eventSlug)) {
    throw new ContentError(`Achievement "${a.slug}" references unknown event "${a.eventSlug}" (src/data/events.ts).`);
  }
}
