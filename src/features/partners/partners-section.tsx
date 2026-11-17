import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section";
import { Marquee } from "@/components/motion/marquee";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { externalLinkProps } from "@/lib/social";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/content";

/** A partner as a large typographic wordmark, or its monochrome logo when one is provided. */
function Wordmark({ partner }: { partner: Partner }) {
  if (partner.logo) {
    return (
      <Image
        src={partner.logo}
        alt=""
        width={240}
        height={64}
        className="h-[clamp(2rem,4vw,3.5rem)] w-auto opacity-80 dark:invert"
      />
    );
  }
  return (
    <span className="text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.05em] whitespace-nowrap">
      {partner.name}
      {partner.short ? <span className="text-muted-foreground"> {partner.short}</span> : null}
    </span>
  );
}

/** One copy of the marquee contents, repeated so a single group is always wider than the screen. */
function MarqueeGroup({ partners }: { partners: Partner[] }) {
  const repeats = Math.max(2, Math.ceil(6 / partners.length));
  const items = Array.from({ length: repeats }, () => partners).flat();
  return (
    <ul className="flex shrink-0 items-center">
      {items.map((p, i) => (
        <li key={`${p.id}-${i}`} className="flex items-center">
          <span className="px-[clamp(1.5rem,3vw,3rem)]">
            <Wordmark partner={p} />
          </span>
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Collaborations: a slow full-bleed marquee of partner wordmarks (pauses on
 * hover, static for reduced motion) above an editorial list with what we did
 * together. Renders nothing while src/data/partners.ts is empty.
 */
export function PartnersSection({ partners, className }: { partners: Partner[]; className?: string }) {
  if (partners.length === 0) return null;

  return (
    <section id="collaborations" aria-labelledby="collaborations-title" className={cn("relative overflow-hidden border-t border-border py-24 sm:py-32", className)}>
      <Container>
        <SectionHeading
          eyebrow="Collaborations"
          title={<span id="collaborations-title">In good company.</span>}
          description="Organisations we have worked with on events, workshops and programmes for developers in Pakistan."
        />
      </Container>

      {/* Decorative motion band; the accessible list of partners follows below. */}
      <Reveal className="mt-16 sm:mt-20">
        <div
          aria-hidden="true"
          className="border-y border-border py-8 select-none sm:py-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
          <Marquee speed={70}>
            <MarqueeGroup partners={partners} />
          </Marquee>
        </div>
      </Reveal>

      <Container>
        <Stagger as="ul" className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p, i) => {
            const body = (
              <>
                <span className="tabular text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block text-xl font-medium tracking-tight">
                    {p.name}
                    {p.short ? <span className="text-muted-foreground"> ({p.short})</span> : null}
                  </span>
                  {p.detail || p.year ? (
                    <span className="mt-1.5 block text-sm leading-snug text-muted-foreground">
                      {[p.detail, p.year].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
                {p.url ? (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  />
                ) : (
                  <span />
                )}
              </>
            );
            const row = "group grid grid-cols-[2.5rem_1fr_auto] items-start gap-3 border-t border-border py-6";
            return (
              <StaggerItem key={p.id}>
                {p.url ? (
                  <a href={p.url} {...externalLinkProps(true)} className={row}>
                    {body}
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <div className={row}>{body}</div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
