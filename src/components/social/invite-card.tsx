import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { externalLinkProps } from "@/lib/social";
import { cn } from "@/lib/utils";
import type { ResolvedSocialLink } from "@/types/social";
import { BrandIcon } from "./brand-icon";
import { CopyLinkButton } from "./copy-link-button";

/** Prominent join card for a community invitation link (WhatsApp, Discord, Telegram, ...). */
export function InviteCard({ link, className }: { link: ResolvedSocialLink; className?: string }) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:border-foreground/25 hover:bg-surface-2",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-md border border-border bg-background text-foreground">
        <BrandIcon icon={link.icon} className="size-5" />
      </div>
      <h3 className="mt-5 text-lg font-medium tracking-tight">{link.label}</h3>
      {link.description ? <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{link.description}</p> : <div className="flex-1" />}
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={link.href}
          {...externalLinkProps(link.external)}
          className={cn(buttonVariants({ size: "lg" }), "bg-foreground text-background hover:bg-foreground/90")}
        >
          Join now
          <ArrowUpRight />
          <span className="sr-only">{link.label}{link.external ? " (opens in a new tab)" : ""}</span>
        </a>
        <CopyLinkButton value={link.href} label={link.label} />
      </div>
    </article>
  );
}
