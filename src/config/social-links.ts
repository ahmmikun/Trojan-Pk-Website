import type { SocialLinkItem } from "@/types/social";

/**
 * Social and community links: the single place to manage them.
 *
 * Edit a URL here and it updates everywhere (navbar, hero, footer, Community
 * and Join pages). Array order is display order. Set `url: null` (or
 * `isVisible: false`) to hide a platform. For `email`, use an address such as
 * "hello@example.com". Invite links (`isInvite: true`) get join cards and a
 * copy-to-clipboard button.
 *
 * Components never import this file directly; they use src/content/social.ts.
 */
export const socialLinks: readonly SocialLinkItem[] = [
  {
    id: "whatsapp",
    platform: "whatsapp",
    label: "WhatsApp Community",
    url: "https://chat.whatsapp.com/HosYEWJuqnvEn21xO0tMqU",
    icon: "whatsapp",
    isInvite: true,
    description: "Day-to-day conversation, announcements and quick help from fellow members.",
    order: 0,
    isVisible: true,
  },
  {
    id: "discord",
    platform: "discord",
    label: "Discord Server",
    url: "https://discord.gg/NGXDASQmfb",
    icon: "discord",
    isInvite: true,
    description: "Topic channels, project teams, voice sessions and hackathon coordination.",
    order: 1,
    isVisible: true,
  },
  {
    id: "telegram",
    platform: "telegram",
    label: "Telegram Channel",
    url: "https://t.me/+HM6YJY9GG8MwM2Nk",
    icon: "telegram",
    isInvite: true,
    description: "Event updates, opportunities and community announcements.",
    order: 2,
    isVisible: true,
  },
  {
    id: "github",
    platform: "github",
    label: "GitHub Organization",
    url: "https://github.com/trojan-pk",
    icon: "github",
    isInvite: false,
    order: 3,
    isVisible: true,
  },
  {
    id: "linkedin",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/trojan-pk",
    icon: "linkedin",
    isInvite: false,
    order: 4,
    isVisible: true,
  },
  {
    id: "instagram",
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/trojans_pk",
    icon: "instagram",
    isInvite: false,
    order: 5,
    isVisible: true,
  },
  // Supported but not yet configured: hidden until a URL is added here.
  { id: "facebook", platform: "facebook", label: "Facebook", url: null, icon: "facebook", isInvite: false, order: 6, isVisible: true },
  { id: "youtube", platform: "youtube", label: "YouTube", url: null, icon: "youtube", isInvite: false, order: 7, isVisible: true },
  { id: "x", platform: "x", label: "X (Twitter)", url: null, icon: "x", isInvite: false, order: 8, isVisible: true },
  { id: "tiktok", platform: "tiktok", label: "TikTok", url: null, icon: "tiktok", isInvite: false, order: 9, isVisible: true },
  { id: "email", platform: "email", label: "Official Email", url: null, icon: "email", isInvite: false, order: 10, isVisible: true },
  { id: "website", platform: "website", label: "Official Website", url: null, icon: "website", isInvite: false, order: 11, isVisible: true },
];
