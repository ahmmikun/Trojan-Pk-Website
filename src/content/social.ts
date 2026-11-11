import { resolveSocialLinks } from "@/lib/social";
import type { ResolvedSocialLink, SocialPlatform } from "@/types/social";
import { allSocialLinks } from "./validated";

/**
 * Single read path for every social/community link on the site. All links are
 * defined once in src/config/social-links.ts, so editing a URL there updates
 * the navbar, hero, footer, community and join pages together.
 */
export async function getSocialLinks(): Promise<ResolvedSocialLink[]> {
  return resolveSocialLinks(allSocialLinks);
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
