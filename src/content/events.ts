import type { CommunityEvent } from "@/types/content";
import { allEvents } from "./validated";
import { isVisible } from "./visibility";
import { dbEvents } from "./db";

const time = (e: CommunityEvent) => e.startsAt?.getTime() ?? 0;

/** Events from Supabase when configured, otherwise from src/data. */
const visibleEvents = async () => (await dbEvents()) ?? allEvents.filter((e) => isVisible(e.published));

export async function getEvents(): Promise<{ upcoming: CommunityEvent[]; past: CommunityEvent[] }> {
  const all = await visibleEvents();
  // The site is built once and served statically, so "upcoming" vs "past" is an
  // explicit status in src/data/events.ts, not a comparison against today's date.
  // Update an event's status to COMPLETED after it happens.
  const upcoming = all.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING").sort((a, b) => time(a) - time(b));
  const past = all.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED").sort((a, b) => time(b) - time(a));
  return { upcoming, past };
}

export async function getEventBySlug(slug: string): Promise<CommunityEvent | null> {
  return (await visibleEvents()).find((e) => e.slug === slug) ?? null;
}

/**
 * Home page selection: upcoming events first (soonest first), then the most recent past
 * ones, up to `limit` in total. A fixed per-group cap would hide events whenever one
 * group is empty (e.g. four completed events and nothing upcoming showed only three).
 */
export async function getEventsPreview(limit = 5): Promise<{ upcoming: CommunityEvent[]; past: CommunityEvent[] }> {
  const { upcoming, past } = await getEvents();
  const shownUpcoming = upcoming.slice(0, limit);
  return { upcoming: shownUpcoming, past: past.slice(0, limit - shownUpcoming.length) };
}
