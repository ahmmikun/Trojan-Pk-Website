import { Globe } from "lucide-react";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Chip } from "@/components/common/chip";
import { Reveal } from "@/components/common/reveal";
import { BrandIcon } from "@/components/social/brand-icon";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/content";

export function MemberAvatar({ member, className }: { member: TeamMember; className?: string }) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-surface-2", className)}>
      {member.photo ? (
        <ParallaxImage
          src={member.photo}
          alt={member.photo.startsWith("/samples/") ? `Illustrative photo for ${member.name}` : `Portrait of ${member.name}`}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-[50%_28%] transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-end bg-[linear-gradient(160deg,color-mix(in_srgb,var(--foreground)_7%,transparent),transparent_60%)] p-6"
        >
          <span className="text-[7rem] leading-none font-medium tracking-tighter text-muted-foreground transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-1">
            {initials(member.name)}
          </span>
        </div>
      )}
    </div>
  );
}

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground";

export function MemberLinks({ member }: { member: TeamMember }) {
  const items = [
    member.github && { label: "GitHub", href: member.github, icon: <BrandIcon icon="github" className="size-4" /> },
    member.linkedin && { label: "LinkedIn", href: member.linkedin, icon: <BrandIcon icon="linkedin" className="size-4" /> },
    member.website && { label: "Website", href: member.website, icon: <Globe aria-hidden="true" className="size-4" /> },
    ...member.otherLinks.map((l) => ({ label: l.label, href: l.url, icon: <Globe aria-hidden="true" className="size-4" /> })),
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[];
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${member.name} links`}>
      {items.map((i) => (
        <li key={i.label + i.href}>
          <a href={i.href} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`${member.name} on ${i.label} (opens in a new tab)`} title={i.label}>
            {i.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Editorial profile: large number and name, portrait on one side, story on the other. */
export function TeamProfile({ member, index = 0 }: { member: TeamMember; index?: number }) {
  return (
    <article id={member.slug} className="group grid scroll-mt-28 gap-10 border-t border-border py-16 sm:py-20 lg:grid-cols-12 lg:gap-12">
      <Reveal className={cn("lg:col-span-4", index % 2 === 1 && "lg:order-2 lg:col-start-9")}>
        <MemberAvatar member={member} className="rounded-2xl" />
      </Reveal>
      <Reveal delay={0.1} className={cn("flex flex-col lg:col-span-7", index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-6")}>
        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <span aria-hidden="true" className="tabular font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true" className="h-px w-8 bg-foreground/25" />
          {member.role}
        </p>
        <h2 className="mt-6 text-5xl leading-[0.98] font-medium tracking-tighter sm:text-6xl">{member.name}</h2>
        <p className="mt-8 max-w-xl text-lg leading-snug text-muted-foreground sm:text-xl">{member.bio}</p>
        {member.interests.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technical interests">
            {member.interests.map((i) => (
              <li key={i}><Chip>{i}</Chip></li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto pt-10"><MemberLinks member={member} /></div>
      </Reveal>
    </article>
  );
}

/** Compact card for previews: portrait with name and role under it. */
export function TeamPreviewCard({ member }: { member: TeamMember }) {
  return (
    <article className="group">
      <MemberAvatar member={member} className="rounded-2xl" />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium tracking-tight">{member.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
        </div>
        <MemberLinks member={member} />
      </div>
    </article>
  );
}
