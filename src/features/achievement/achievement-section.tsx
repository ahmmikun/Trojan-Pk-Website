import { ArrowUpRight, Trophy } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/common/button-link";
import { Chip } from "@/components/common/chip";
import { Section, SectionHeading } from "@/components/common/section";
import { formatDate } from "@/lib/format";
import type { Achievement } from "@/types/content";

type Props = {
  achievement: Achievement;
};

/** Featured achievement: verified details only, genuine images when supplied. */
export function AchievementSection({ achievement }: Props) {
  const projectSlug = achievement.projectSlug;
  const eventSlug = achievement.eventSlug;
  return (
    <Section id="achievement" className="bg-surface">
      <SectionHeading eyebrow="Featured achievement" title={achievement.title} description={achievement.description} />

      <div className="mt-12 grid gap-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-lg border border-border bg-background p-7 lg:col-span-3">
          <div aria-hidden="true" className="bg-dots absolute inset-0 opacity-50" />
          <div aria-hidden="true" className="absolute -top-24 -right-24 size-64 rounded-full bg-brand-violet/20 blur-3xl" />
          <div className="relative">
            <Chip tone="accent" className="gap-1.5">
              <Trophy aria-hidden="true" className="size-3" />
              {achievement.badge}
            </Chip>
            <p className="mt-8 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Featured project</p>
            <h3 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{achievement.projectName}</h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{achievement.projectSummary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {projectSlug ? (
                <ButtonLink href={`/projects/${projectSlug}`} emphasis>
                  View project <ArrowUpRight />
                </ButtonLink>
              ) : null}
              {eventSlug ? <ButtonLink href={`/events/${eventSlug}`} variant="outline">Event details</ButtonLink> : null}
              {achievement.links.map((l) => (
                <ButtonLink key={l.url} href={l.url} external variant="outline">
                  {l.label} <ArrowUpRight />
                </ButtonLink>
              ))}
            </div>
          </div>
        </div>

        <ol className="rounded-lg border border-border bg-background p-7 lg:col-span-2" aria-label="Achievement timeline">
          {achievement.timeline.map((step, i) => {
            const date = formatDate(step.date);
            return (
              <li key={step.title} className="relative pb-8 pl-8 last:pb-0">
                {i < achievement.timeline.length - 1 ? <span aria-hidden="true" className="absolute top-3 bottom-0 left-[5px] w-px bg-border" /> : null}
                <span aria-hidden="true" className="absolute top-1.5 left-0 size-[11px] rounded-full border border-brand-blue bg-background" />
                <p className="font-mono text-xs tracking-[0.14em] text-brand-blue uppercase">{step.label}</p>
                <h4 className="mt-1 text-base font-medium">{step.title}</h4>
                {date && step.date ? <time dateTime={step.date.toISOString().slice(0, 10)} className="mt-1 block text-sm text-muted-foreground">{date}</time> : null}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              </li>
            );
          })}
        </ol>
      </div>

      {achievement.images.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievement.images.map((img) => (
            <li key={img.src} className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border">
              <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
