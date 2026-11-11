import type { Achievement, CommunityStat, Testimonial } from "@/types/content";
import { allAchievements, allStats, allTestimonials } from "./validated";

/** Stats with a configured value only: never invented, never padded. */
export async function getStats(): Promise<(CommunityStat & { value: number })[]> {
  return allStats.filter((s): s is CommunityStat & { value: number } => s.value !== null);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return allTestimonials;
}

export async function getFeaturedAchievement(): Promise<Achievement | null> {
  return allAchievements[0] ?? null;
}
