import { Globe } from "lucide-react";
import Image from "next/image";
import { Chip } from "@/components/common/chip";
import { BrandIcon } from "@/components/social/brand-icon";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/content";

export function MemberAvatar({ member, className }: { member: TeamMember; className?: string }) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-surface-2", className)}>
      {member.photo ? (
        <Image src={member.photo} alt={`Portrait of ${member.name}`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      ) : (
        <div aria-hidden="true" className="bg-dots absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-6xl font-light tracking-widest text-foreground/25">{initials(member.name)}</span>
        </div>
      )}
    </div>
  );
}

const iconLink = "inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/5 hover:text-foreground";

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

/** Editorial profile: portrait left, story right. Alternates sides on large screens. */
export function TeamProfile({ member, index = 0 }: { member: TeamMember; index?: number }) {
  return (
    <article id={member.slug} className="grid scroll-mt-24 items-center gap-8 py-12 lg:grid-cols-12 lg:gap-14">
      <MemberAvatar member={member} className={cn("rounded-lg border border-border lg:col-span-4", index % 2 === 1 && "lg:order-2")} />
      <div className="lg:col-span-8">
        <p className="font-mono text-xs tracking-[0.18em] text-brand-blue uppercase">
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")} / </span>
          {member.role}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{member.name}</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{member.bio}</p>
        {member.interests.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technical interests">
            {member.interests.map((i) => (
              <li key={i}><Chip>{i}</Chip></li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6"><MemberLinks member={member} /></div>
      </div>
    </article>
  );
}

/** Compact card for the homepage preview. */
export function TeamPreviewCard({ member }: { member: TeamMember }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface">
      <MemberAvatar member={member} className="border-b border-border" />
      <div className="p-5">
        <h3 className="text-lg font-medium tracking-tight">{member.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
        <div className="mt-4"><MemberLinks member={member} /></div>
      </div>
    </article>
  );
}
