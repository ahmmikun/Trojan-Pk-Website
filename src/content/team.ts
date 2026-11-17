import type { TeamMember } from "@/types/content";
import { allTeam } from "./validated";
import { dbTeam } from "./db";

/** Team from Supabase when configured, otherwise src/data/team.ts. */
export async function getTeam(): Promise<TeamMember[]> {
  return [...((await dbTeam()) ?? allTeam)].sort((a, b) => a.order - b.order);
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  return (await getTeam()).find((m) => m.slug === slug) ?? null;
}
