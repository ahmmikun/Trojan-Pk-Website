import type { ResolvedSocialLink, SocialLinkItem } from "@/types/social";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turn a stored link into a safe, renderable one.
 * Returns null when the link is hidden, empty or has an unsafe/invalid URL,
 * which is how "hide platforms without configured URLs" is enforced.
 */
export function resolveSocialLink(item: SocialLinkItem): ResolvedSocialLink | null {
  if (!item.isVisible) return null;
  const raw = item.url?.trim();
  if (!raw) return null;

  const { url, ...rest } = item;
  void url;

  if (item.platform === "email") {
    const address = raw.replace(/^mailto:/i, "");
    if (!EMAIL_RE.test(address)) return null;
    return { ...rest, href: `mailto:${address}`, external: false };
  }

  try {
    const parsed = new URL(raw);
    // Only allow web URLs: blocks javascript:, data:, etc.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { ...rest, href: parsed.toString(), external: true };
  } catch {
    return null;
  }
}

export function resolveSocialLinks(items: readonly SocialLinkItem[]): ResolvedSocialLink[] {
  return items
    .map(resolveSocialLink)
    .filter((l): l is ResolvedSocialLink => l !== null)
    .sort((a, b) => a.order - b.order);
}

/** Props for outbound anchors: secure by default. */
export function externalLinkProps(external: boolean) {
  return external ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};
}
