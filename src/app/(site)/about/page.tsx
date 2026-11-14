import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { NumberedList } from "@/components/common/numbered-list";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Timeline } from "@/components/common/timeline";
import { Stagger, StaggerItem } from "@/components/motion/motion";
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

/**
 * Flow: identity -> purpose -> story -> proof (milestones) -> principles -> people -> ask.
 * The two narrative sections (story, milestones) sit together; text-only
 * blocks are split up by the mission/vision panels and the team portraits.
 */
export default async function AboutPage() {
  const [team, achievement] = await Promise.all([getTeam(), getFeaturedAchievement()]);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A community of people who build."
        description="Trojans PK is a Pakistan-based developer, technology and open-source community. Not an agency. Not a company."
      />

      {/* 1. Identity: one large statement */}
      <Section bordered={false} id="who-we-are">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="text-sm text-muted-foreground">Who we are</p>
          </Reveal>
          <Reveal className="lg:col-span-9">
            <p className="text-3xl leading-[1.15] font-medium tracking-tight text-balance sm:text-4xl lg:text-5xl">{aboutCopy.whoWeAre}</p>
          </Reveal>
        </div>
      </Section>

      {/* 2. Purpose */}
      <Section id="mission-vision">
        <Stagger as="div" className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {[
            { label: "Mission", body: aboutCopy.mission },
            { label: "Vision", body: aboutCopy.vision },
          ].map((b, i) => (
            <StaggerItem as="div" key={b.label} className="flex min-h-80 flex-col justify-between bg-background p-8 sm:p-12">
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="tabular font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                Our {b.label.toLowerCase()}
              </p>
              <p className="mt-16 text-2xl leading-[1.2] font-medium tracking-tight sm:text-3xl">{b.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 3. Story */}
      <Section id="story">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading className="lg:col-span-5" eyebrow="Our story" title="Learning through practical projects." />
          <Reveal className="space-y-6 text-lg leading-snug text-muted-foreground sm:text-xl lg:col-span-6 lg:col-start-7">
            {aboutCopy.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* 4. Proof: the story continues as milestones */}
      {achievement ? (
        <Section id="journey">
          <div className="grid gap-12 lg:grid-cols-12">
            <SectionHeading
              className="lg:col-span-4"
              eyebrow="Community journey"
              title="Important milestones"
              description="Verified milestones from our journey so far. More will be added as the community grows."
            />
            <Reveal className="lg:col-span-7 lg:col-start-6">
              <Timeline
                ariaLabel="Community milestones"
                items={[{ label: "Achievement", title: achievement.title, detail: `${achievement.subtitle}. ${achievement.projectName}: ${achievement.projectSummary}`, date: null }, ...achievement.timeline]}
              />
            </Reveal>
          </div>
        </Section>
      ) : null}

      {/* 5. Principles */}
      <Section id="values">
        <SectionHeading eyebrow="Core values" title="What we hold ourselves to" />
        <NumberedList className="mt-16" items={coreValues} />
      </Section>

      {/* 6. People */}
      <Section id="leadership">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Leadership" title="Meet the people leading Trojans PK" />
          <ButtonLink href="/team" variant="outline">Full team <ArrowRight /></ButtonLink>
        </div>
        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <StaggerItem key={m.slug}><TeamPreviewCard member={m} /></StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 7. Ask */}
      <FinalCta />
    </>
  );
}
