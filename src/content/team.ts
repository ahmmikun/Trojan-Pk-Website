import type { TeamMember } from "@/types/content";
import { allTeam } from "./validated";

export async function getTeam(): Promise<TeamMember[]> {
  return [...allTeam].sort((a, b) => a.order - b.order);
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  return allTeam.find((m) => m.slug === slug) ?? null;
}
