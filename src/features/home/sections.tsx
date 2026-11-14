import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";
import { EmptyState } from "@/components/common/empty-state";
import { MediaGrid } from "@/components/common/media-grid";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { focusAreas } from "@/config/copy";
import { eventToMedia } from "@/features/events/event-card";
import { ProjectCard } from "@/features/projects/project-card";
import { ExpandingGallery } from "./expanding-gallery";
import { TeamPreviewCard } from "@/features/team/team-card";
import { getEventsPreview } from "@/content/events";
import { getFeaturedProjects } from "@/content/projects";
import { getStats, getTestimonials } from "@/content/site-content";
import { getTeam } from "@/content/team";

const differentiators = [
  { title: "Community, not company", body: "No clients, no agency work. Members build and learn for themselves and for each other." },
  { title: "Projects over theory", body: "We value shipped work: products, open-source contributions and hackathon entries." },
  { title: "Rooted in Pakistan", body: "Built by developers in Pakistan, for developers in Pakistan, with a global standard of craft." },
];

export function Introduction() {
  return (
    <Section id="about-community">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Our mission"
            title="A place to learn by building, together."
            description="Trojans PK brings developers, students, designers and innovators together to share knowledge, contribute to open source and build real products."
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/about" variant="outline" className="mt-10">
              About Trojans PK <ArrowRight />
            </ButtonLink>
          </Reveal>
        </div>
        <Stagger className="border-b border-border lg:col-span-7">
          {differentiators.map((d, i) => (
            <StaggerItem key={d.title} className="group grid gap-3 border-t border-border py-8 sm:grid-cols-[3rem_1fr] sm:gap-6">
              <p className="tabular text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
              <div className="transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1">
                <h3 className="text-2xl font-medium tracking-tight">{d.title}</h3>
                <p className="mt-2 max-w-md text-base leading-snug text-muted-foreground">{d.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

export function WhatWeDo() {
  return (
    <Section id="what-we-do" containerSize="wide">
      <SectionHeading eyebrow="What we do" title="Six ways we grow together" description="Every focus area is built around practice: building, contributing, competing and sharing." />
      <Reveal className="mt-16">
        <ExpandingGallery
          items={focusAreas.map((a) => ({ title: a.title, description: a.description, image: a.image, icon: <a.icon aria-hidden="true" className="size-[18px]" /> }))}
        />
      </Reveal>
    </Section>
  );
}

/** Renders nothing unless at least one real figure is configured. */
export async function CommunityImpact() {
  const stats = await getStats();
  if (stats.length === 0) return null;
  return (
    <Section id="impact">
      <SectionHeading eyebrow="Community impact" title="What we have built so far" />
      <dl className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="bg-background p-8">
            <dd className="tabular text-5xl font-medium tracking-tighter">
              {s.value.toLocaleString("en-US")}
              {s.suffix ?? ""}
            </dd>
            <dt className="mt-3 text-sm text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects(3);
  return (
    <Section id="featured-projects">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Featured projects" title="Built by the community" />
        <ButtonLink href="/projects" variant="outline">All projects <ArrowRight /></ButtonLink>
      </div>
      {projects.length > 0 ? (
        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.slug}><ProjectCard project={p} /></StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState className="mt-16" title="Featured projects coming soon" />
      )}
    </Section>
  );
}

export async function EventsPreview() {
  const { upcoming, past } = await getEventsPreview();
  const events = [...upcoming, ...past];
  return (
    <Section id="events" containerSize="wide">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Events" title="Where we show up" description="Hackathons, workshops, sessions and meetups, past and upcoming." />
        <ButtonLink href="/events" variant="outline">All events <ArrowRight /></ButtonLink>
      </div>
      {events.length > 0 ? (
        <MediaGrid className="mt-16" items={events.map(eventToMedia)} />
      ) : (
        <EmptyState className="mt-16" title="No events yet" description="Join the community channels to hear about the next one first." />
      )}
    </Section>
  );
}

export async function TeamPreview() {
  const team = await getTeam();
  return (
    <Section id="team">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Leadership" title="The people behind Trojans PK" />
        <ButtonLink href="/team" variant="outline">Meet the team <ArrowRight /></ButtonLink>
      </div>
      <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <StaggerItem key={m.slug}><TeamPreviewCard member={m} /></StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/** Genuine member feedback only. The section is omitted until testimonials exist. */
export async function Testimonials() {
  const items = await getTestimonials();
  if (items.length === 0) return null;
  return (
    <Section id="testimonials" className="bg-surface">
      <SectionHeading eyebrow="Community voices" title="What members say" />
      <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <StaggerItem key={t.id}>
            <figure className="flex h-full flex-col rounded-xl border border-border bg-background p-7">
              <blockquote className="flex-1 text-lg leading-snug text-foreground/90">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-8 border-t border-border pt-4 text-sm">
                <span className="font-medium">{t.name}</span>
                {t.role ? <span className="text-muted-foreground"> · {t.role}</span> : null}
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <Container className="relative py-28 text-center sm:py-40">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-balance text-5xl font-medium tracking-tighter sm:text-7xl">
            Your next big idea could start here.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-snug text-muted-foreground sm:text-xl">
            Join developers across Pakistan who learn, build and ship together.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/join" emphasis className="h-12 px-7 text-base">
              Join community <ArrowRight />
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
