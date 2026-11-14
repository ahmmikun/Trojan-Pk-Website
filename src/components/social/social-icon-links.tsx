import { cn } from "@/lib/utils";
import { externalLinkProps } from "@/lib/social";
import type { ResolvedSocialLink, SocialPlatform } from "@/types/social";
import { BrandIcon } from "./brand-icon";

type Props = {
  links: readonly ResolvedSocialLink[];
  /** Restrict to specific platforms (rendered in the order given). */
  only?: readonly SocialPlatform[];
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
};

/** Icon-only social row. Renders nothing when there are no configured links. */
export function SocialIconLinks({ links, only, size = "md", className, ...aria }: Props) {
  const items = only
    ? only.flatMap((p) => links.filter((l) => l.platform === p))
    : links;
  if (items.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label={aria["aria-label"] ?? "Social links"}>
      {items.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            {...externalLinkProps(link.external)}
            aria-label={link.external ? `${link.label} (opens in a new tab)` : link.label}
            title={link.label}
            className={cn(
              "inline-flex items-center justify-center rounded-md border border-border text-muted-foreground transition-colors",
              "hover:border-foreground/20 hover:bg-foreground/5 hover:text-foreground",
              size === "sm" ? "size-8" : "size-10",
            )}
          >
            <BrandIcon icon={link.icon} className={size === "sm" ? "size-3.5" : "size-4"} />
          </a>
        </li>
      ))}
    </ul>
  );
}
