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

export async function getEventsPreview(): Promise<{ upcoming: CommunityEvent[]; past: CommunityEvent[] }> {
  const { upcoming, past } = await getEvents();
  return { upcoming: upcoming.slice(0, 3), past: past.slice(0, 3) };
}
