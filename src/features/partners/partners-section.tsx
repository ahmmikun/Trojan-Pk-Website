import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo, brandFor } from "@/components/brand/partner-logos";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section";
import { Marquee } from "@/components/motion/marquee";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { externalLinkProps } from "@/lib/social";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/content";

/**
 * A partner's logo: an uploaded logo first (monochrome artwork, inverted in dark mode),
 * then a built-in brand logo (AWS, Google), then the name set as a wordmark.
 */
function PartnerMark({ partner, size }: { partner: Partner; size: "card" | "band" }) {
  const height = size === "card" ? "h-[clamp(2.75rem,5vw,4rem)]" : "h-[clamp(1.75rem,3vw,2.5rem)]";
  if (partner.logo) {
    return <Image src={partner.logo} alt="" width={320} height={96} className={cn(height, "w-auto object-contain dark:invert")} />;
  }
  if (brandFor(partner.id)) return <span className={cn("block text-foreground", height)}><BrandLogo slug={partner.id} /></span>;
  return (
    <span className={cn("leading-none font-medium tracking-[-0.05em] whitespace-nowrap", size === "card" ? "text-[clamp(2rem,4vw,3rem)]" : "text-[clamp(1.75rem,3vw,2.5rem)]")}>
      {partner.short ?? partner.name}
    </span>
  );
}

/** One copy of the marquee contents, repeated so a single group is always wider than the screen. */
function MarqueeGroup({ partners }: { partners: Partner[] }) {
  const repeats = Math.max(2, Math.ceil(8 / partners.length));
  const items = Array.from({ length: repeats }, () => partners).flat();
  return (
    <ul className="flex shrink-0 items-center">
      {items.map((p, i) => (
        <li key={`${p.id}-${i}`} className="flex items-center px-[clamp(2rem,4vw,4rem)] opacity-70">
          <PartnerMark partner={p} size="band" />
        </li>
      ))}
    </ul>
  );
}

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const meta = [partner.detail, partner.year].filter(Boolean).join(" · ");
  const body = (
    <>
      {/* Logo stage: a soft spotlight and hairline grid sit behind the mark and brighten on hover. */}
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-border px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,color-mix(in_oklab,var(--foreground)_7%,transparent),transparent_70%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]"
        />
        <span className="tabular absolute top-4 left-5 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <div className="relative transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.04]">
          <PartnerMark partner={partner} size="card" />
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <span className="min-w-0">
          <span className="block text-lg font-medium tracking-tight">{partner.name}</span>
          {meta ? <span className="mt-1 block text-sm leading-snug text-muted-foreground">{meta}</span> : null}
        </span>
        {partner.url ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-[color,background-color,border-color] duration-500 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-px group-hover:-translate-y-px" />
          </span>
        ) : null}
      </div>
    </>
  );
  const card =
    "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)]";
  return partner.url ? (
    <a href={partner.url} {...externalLinkProps(true)} className={cn(card, "outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background")}>
      {body}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <div className={card}>{body}</div>
  );
}

/**
 * Collaborations: partner cards with their logos (AWS and Google built in, others uploaded
 * in the admin), above a slow logo marquee once there are enough partners to fill it.
 * Renders nothing when there are no partners.
 */
export function PartnersSection({ partners, className }: { partners: Partner[]; className?: string }) {
  if (partners.length === 0) return null;
  const columns = partners.length === 1 ? "sm:max-w-xl" : partners.length === 2 || partners.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="collaborations" aria-labelledby="collaborations-title" className={cn("relative overflow-hidden border-t border-border py-24 sm:py-32", className)}>
      <Container>
        <SectionHeading
          eyebrow="Collaborations"
          title={<span id="collaborations-title">In good company.</span>}
          description="Organisations we have worked with on events, workshops and programmes for developers in Pakistan."
        />

        <Stagger as="ul" className={cn("mt-14 grid gap-4 sm:mt-16 sm:gap-5", columns)}>
          {partners.map((p, i) => (
            <StaggerItem as="li" key={p.id}>
              <PartnerCard partner={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>

      {/* Decorative band; the cards above are the accessible list. Only when there are enough logos to read as a band. */}
      {partners.length >= 3 ? (
        <Reveal className="mt-16 sm:mt-20">
          <div aria-hidden="true" className="border-y border-border py-8 select-none sm:py-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <Marquee speed={50}>
              <MarqueeGroup partners={partners} />
            </Marquee>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
