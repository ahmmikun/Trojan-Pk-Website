import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
import { Timeline } from "@/components/common/timeline";
import { aboutCopy, coreValues } from "@/config/copy";
import { FinalCta } from "@/features/home/sections";
import { TeamPreviewCard } from "@/features/team/team-card";
import { getFeaturedAchievement } from "@/content/site-content";
import { getTeam } from "@/content/team";

export const metadata: Metadata = {
  title: "About",
  description: "Who Trojans PK is, what we stand for, and the milestones of Pakistan's developer and open-source community.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [team, achievement] = await Promise.all([getTeam(), getFeaturedAchievement()]);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A community of people who build."
        description="Trojans PK is a Pakistan-based developer, technology and open-source community. Not an agency. Not a company."
      />

      <Section bordered={false} id="who-we-are">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading className="lg:col-span-4" eyebrow="Who we are" title="Builders, learners, collaborators." />
          <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-8">{aboutCopy.whoWeAre}</p>
        </div>
      </Section>

      <Section id="story">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading className="lg:col-span-4" eyebrow="Our story" title="Learning through practical projects." />
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-8">
            {aboutCopy.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section id="mission-vision" className="bg-surface">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-8 sm:p-10">
            <p className="text-xs text-brand-blue">Our mission</p>
            <p className="mt-5 text-xl leading-relaxed text-foreground/90">{aboutCopy.mission}</p>
          </div>
          <div className="bg-background p-8 sm:p-10">
            <p className="text-xs text-brand-blue">Our vision</p>
            <p className="mt-5 text-xl leading-relaxed text-foreground/90">{aboutCopy.vision}</p>
          </div>
        </div>
      </Section>

      <Section id="values">
        <SectionHeading eyebrow="Core values" title="What we hold ourselves to" />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((v) => (
            <li key={v.title} className="group bg-background p-7 transition-colors hover:bg-surface-2">
              <v.icon aria-hidden="true" className="size-5 text-brand-blue" />
              <h3 className="mt-5 text-lg font-medium tracking-tight">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {achievement ? (
        <Section id="journey" className="bg-surface">
          <div className="grid gap-12 lg:grid-cols-12">
            <SectionHeading
              className="lg:col-span-5"
              eyebrow="Community journey"
              title="Important milestones"
              description="Verified milestones from our journey so far. More will be added as the community grows."
            />
            <div className="lg:col-span-7">
              <Timeline
                ariaLabel="Community milestones"
                items={[{ label: "Achievement", title: achievement.title, detail: `${achievement.subtitle}. ${achievement.projectName}: ${achievement.projectSummary}`, date: null }, ...achievement.timeline]}
              />
            </div>
          </div>
        </Section>
      ) : null}

      <Section id="leadership">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Leadership" title="Meet the people leading Trojans PK" />
          <ButtonLink href="/team" variant="outline">Full team <ArrowRight /></ButtonLink>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <li key={m.slug}><TeamPreviewCard member={m} /></li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
