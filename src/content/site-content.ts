import type { Achievement, CommunityStat, Partner, Testimonial } from "@/types/content";
import { allAchievements, allPartners, allStats, allTestimonials } from "./validated";
import { dbAchievements, dbPartners, dbSiteSettings, dbStats, dbTestimonials, type SiteSettings } from "./db";
import { siteConfig } from "@/config/site";

/** Each loader reads Supabase when configured and falls back to the files in src/data. */
export async function getPartners(): Promise<Partner[]> {
  return (await dbPartners()) ?? allPartners;
}

/** Stats with a configured value only: never invented, never padded. */
export async function getStats(): Promise<(CommunityStat & { value: number })[]> {
  return ((await dbStats()) ?? allStats).filter((s): s is CommunityStat & { value: number } => s.value !== null);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await dbTestimonials()) ?? allTestimonials;
}

export async function getFeaturedAchievement(): Promise<Achievement | null> {
  return ((await dbAchievements()) ?? allAchievements)[0] ?? null;
}

/** Editable site settings (tagline, description, application form link), with src/config/site.ts as fallback. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return (
    (await dbSiteSettings()) ?? {
      tagline: siteConfig.tagline,
      description: siteConfig.description,
      applicationFormUrl: siteConfig.applicationFormUrl,
      contactEmail: null,
      defaultOgImage: null,
    }
  );
}
