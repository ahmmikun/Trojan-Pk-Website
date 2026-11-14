import { BrandIcon } from "@/components/social/brand-icon";
import { CopyLinkButton } from "@/components/social/copy-link-button";
import type { SocialPlatform } from "@/types/social";

type Props = { url: string; title: string };

/** Share links use each platform's public share URL (no SDKs, no trackers). */
export function ShareLinks({ url, title }: Props) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const targets: { label: string; icon: SocialPlatform; href: string }[] = [
    { label: "Share on X", icon: "x", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "Share on LinkedIn", icon: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Share on Facebook", icon: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Share on WhatsApp", icon: "whatsapp", href: `https://wa.me/?text=${t}%20${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-muted-foreground">Share</span>
      {targets.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${s.label} (opens in a new tab)`}
          title={s.label}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-foreground/5 hover:text-foreground"
        >
          <BrandIcon icon={s.icon} className="size-4" />
        </a>
      ))}
      <CopyLinkButton value={url} label={title} />
    </div>
  );
}
