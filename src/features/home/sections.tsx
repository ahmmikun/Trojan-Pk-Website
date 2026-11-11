import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";
import { EmptyState } from "@/components/common/empty-state";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { focusAreas } from "@/config/copy";
import { EventCard } from "@/features/events/event-card";
import { ProjectCard } from "@/features/projects/project-card";
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
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Our mission"
            title="A place to learn by building, together."
            description="Trojans PK brings developers, students, designers and innovators together to share knowledge, contribute to open source and build real products."
          />
          <ButtonLink href="/about" variant="outline" className="mt-8">
            About Trojans PK <ArrowRight />
          </ButtonLink>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:col-span-7">
          {differentiators.map((d, i) => (
            <li key={d.title} className="bg-background p-6 sm:p-7">
              <Reveal delay={i * 0.06}>
                <p className="font-mono text-xs text-brand-blue">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-medium tracking-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function WhatWeDo() {
  return (
    <Section id="what-we-do" className="bg-surface">
      <SectionHeading eyebrow="What we do" title="Six ways we grow together" description="Every focus area is built around practice: building, contributing, competing and sharing." />
      <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {focusAreas.map((a) => (
          <li key={a.title} className="group bg-background p-7 transition-colors hover:bg-surface-2">
            <span className="flex size-10 items-center justify-center rounded-md border border-border text-brand-blue transition-colors group-hover:border-brand-blue/40">
              <a.icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-medium tracking-tight">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
          </li>
        ))}
      </ul>
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
      <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="bg-background p-7">
            <dd className="text-4xl font-semibold tracking-tight">
              {s.value.toLocaleString("en-US")}
              {s.suffix ?? ""}
            </dd>
            <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
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
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}><ProjectCard project={p} /></li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-12" title="Featured projects coming soon" />
      )}
    </Section>
  );
}

export async function EventsPreview() {
  const { upcoming, past } = await getEventsPreview();
  return (
    <Section id="events" className="bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Events" title="Where we show up" description="Hackathons, workshops, sessions and meetups, past and upcoming." />
        <ButtonLink href="/events" variant="outline">All events <ArrowRight /></ButtonLink>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Upcoming</h3>
          {upcoming.length > 0 ? (
            <ul className="grid gap-5">
              {upcoming.map((e) => (
                <li key={e.slug}><EventCard event={e} /></li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No upcoming events right now" description="Join the community channels to hear about the next one first." />
          )}
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Previous</h3>
          {past.length > 0 ? (
            <ul className="grid gap-5">
              {past.map((e) => (
                <li key={e.slug}><EventCard event={e} /></li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No previous events yet" />
          )}
        </div>
      </div>
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
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <li key={m.slug}><TeamPreviewCard member={m} /></li>
        ))}
      </ul>
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
      <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.id}>
            <figure className="flex h-full flex-col rounded-lg border border-border bg-background p-6">
              <blockquote className="flex-1 text-base leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4 text-sm">
                <span className="font-medium">{t.name}</span>
                {t.role ? <span className="text-muted-foreground"> · {t.role}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div aria-hidden="true" className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_90%_at_50%_100%,#000_30%,transparent_100%)]" />
      <Container className="relative py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Your Next Big Idea Could <span className="text-gradient">Start Here.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Join developers across Pakistan who learn, build and ship together.
        </p>
        <div className="mt-9 flex justify-center">
          <ButtonLink href="/join" emphasis className="h-11 px-6 text-base">
            Join Community <ArrowRight />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
