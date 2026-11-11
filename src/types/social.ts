export const SOCIAL_PLATFORMS = [
  "whatsapp",
  "discord",
  "telegram",
  "instagram",
  "linkedin",
  "github",
  "facebook",
  "youtube",
  "x",
  "tiktok",
  "email",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Where a link may be rendered. */
export type SocialPlacement = "navbar" | "hero" | "footer" | "community" | "contact";

export type SocialLinkItem = {
  id: string;
  platform: SocialPlatform;
  /** Custom display label, e.g. "WhatsApp Community". */
  label: string;
  /** Raw value: a URL, or an email address for the `email` platform. Null/empty hides the link. */
  url: string | null;
  /** Icon key. Defaults to the platform; set a different brand icon if needed. */
  icon: SocialPlatform;
  /** Community invitation links get join cards + copy-to-clipboard. */
  isInvite: boolean;
  /** Short description shown on invite cards. */
  description?: string | null;
  order: number;
  isVisible: boolean;
};

/** A link that has been validated and is ready to render. */
export type ResolvedSocialLink = Omit<SocialLinkItem, "url"> & {
  /** Final href (mailto: for email). */
  href: string;
  /** Whether the href leaves the site and needs target/rel hardening. */
  external: boolean;
};
