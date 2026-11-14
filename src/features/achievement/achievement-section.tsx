import { ArrowUpRight, Trophy } from "lucide-react";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { ButtonLink } from "@/components/common/button-link";
import { Chip } from "@/components/common/chip";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { Timeline } from "@/components/common/timeline";
import type { Achievement } from "@/types/content";

type Props = {
  achievement: Achievement;
};

/** Featured achievement: verified details only, genuine images when supplied. */
export function AchievementSection({ achievement }: Props) {
  const projectSlug = achievement.projectSlug;
  const eventSlug = achievement.eventSlug;
  return (
    <Section id="achievement">
      <SectionHeading eyebrow="Featured achievement" title={achievement.title} description={achievement.description} />

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <Reveal className="relative flex min-h-[28rem] flex-col overflow-hidden rounded-2xl bg-surface p-8 sm:p-12 lg:col-span-6">
          <Chip tone="accent" className="gap-1.5 self-start">
            <Trophy aria-hidden="true" className="size-3" />
            {achievement.badge}
          </Chip>
          <div className="mt-auto pt-16">
            <p className="text-sm text-muted-foreground">Featured project</p>
            <h3 className="mt-3 text-6xl leading-[0.95] font-medium tracking-tighter sm:text-7xl">{achievement.projectName}</h3>
            <p className="mt-5 max-w-md text-lg leading-snug text-muted-foreground">{achievement.projectSummary}</p>
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
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6">
          <Timeline ariaLabel="Achievement timeline" items={achievement.timeline} />
        </Reveal>
      </div>

      {achievement.images.length > 0 ? (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievement.images.map((img) => (
            <li key={img.src} className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <ParallaxImage src={img.src} alt={img.alt} sizes="(min-width: 1024px) 33vw, 100vw" />
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
