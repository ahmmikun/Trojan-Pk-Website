import { ArrowUpRight } from "lucide-react";
import { externalLinkProps } from "@/lib/social";
import { cn } from "@/lib/utils";
import type { ResolvedSocialLink } from "@/types/social";
import { BrandIcon } from "./brand-icon";
import { CopyLinkButton } from "./copy-link-button";

/** Tall join card for a community invitation link (WhatsApp, Discord, Telegram, ...). */
export function InviteCard({ link, className }: { link: ResolvedSocialLink; className?: string }) {
  return (
    <article
      className={cn(
        "group flex h-full min-h-80 flex-col rounded-2xl border border-border bg-surface p-8 transition-all duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:border-foreground/25",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground">
          <BrandIcon icon={link.icon} className="size-5" />
        </span>
        <ArrowUpRight aria-hidden="true" className="size-5 text-muted-foreground transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
      <h3 className="mt-auto pt-16 text-3xl font-medium tracking-tight">{link.label}</h3>
      {link.description ? <p className="mt-2 text-base leading-snug text-muted-foreground">{link.description}</p> : null}
      <div className="mt-8 flex flex-wrap gap-2">
        <a
          href={link.href}
          {...externalLinkProps(link.external)}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Join now
          <span className="sr-only">{link.label}{link.external ? " (opens in a new tab)" : ""}</span>
        </a>
        <CopyLinkButton value={link.href} label={link.label} className="h-11 rounded-full px-5" />
      </div>
    </article>
  );
}
