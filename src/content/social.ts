import { resolveSocialLinks } from "@/lib/social";
import type { ResolvedSocialLink, SocialPlatform } from "@/types/social";
import { allSocialLinks } from "./validated";
import { dbSocialLinks } from "./db";

/**
 * Single read path for every social/community link on the site. Links are edited in
 * /admin/settings (Supabase); src/config/social-links.ts is the fallback when the
 * database is not configured. Either way they update the navbar, hero, footer,
 * community and join pages together.
 */
export async function getSocialLinks(): Promise<ResolvedSocialLink[]> {
  return resolveSocialLinks((await dbSocialLinks()) ?? allSocialLinks);
}

/** Community invitation links (WhatsApp / Discord / Telegram, ...). */
export async function getInviteLinks(): Promise<ResolvedSocialLink[]> {
  return (await getSocialLinks()).filter((l) => l.isInvite);
}

/** Non-invite profile links (GitHub, LinkedIn, Instagram, ...). */
export async function getProfileLinks(): Promise<ResolvedSocialLink[]> {
  return (await getSocialLinks()).filter((l) => !l.isInvite);
}

export async function getSocialLink(platform: SocialPlatform): Promise<ResolvedSocialLink | null> {
  return (await getSocialLinks()).find((l) => l.platform === platform) ?? null;
}
