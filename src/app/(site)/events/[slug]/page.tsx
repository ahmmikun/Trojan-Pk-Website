import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";
import { Cover } from "@/components/common/cover";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { siteConfig } from "@/config/site";
import { EventStatusChip, eventTypeLabel } from "@/features/events/event-card";
import { eventDateLabel } from "@/lib/format";
import { getEventBySlug, getEvents } from "@/content/events";

// Known slugs are prerendered at build time. Others render on demand; notFound() handles unknown ones.
export const revalidate = 3600;

export async function generateStaticParams() {
  const { upcoming, past } = await getEvents();
  return [...upcoming, ...past].map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { title: event.title, description: event.summary, type: "article", url: `/events/${event.slug}`, images: event.image ? [event.image] : undefined },
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const date = eventDateLabel(event);
  const open = event.status === "UPCOMING" || event.status === "ONGOING";
  const facts = [
    date && { icon: CalendarDays, label: "Date and time", value: date },
    event.location && { icon: MapPin, label: "Location", value: event.location },
    event.organizer && { icon: UserRound, label: "Organizer", value: event.organizer },
  ].filter(Boolean) as { icon: typeof CalendarDays; label: string; value: string }[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.summary,
          url: `${siteConfig.url}/events/${event.slug}`,
          ...(event.startsAt ? { startDate: event.startsAt.toISOString() } : {}),
          ...(event.endsAt ? { endDate: event.endsAt.toISOString() } : {}),
          eventStatus: event.status === "CANCELLED" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
          ...(event.location ? { location: { "@type": "Place", name: event.location } } : {}),
          ...(event.organizer ? { organizer: { "@type": "Organization", name: event.organizer } } : {}),
        }}
      />
      <Container className="pt-10">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> All events
        </Link>
      </Container>

      <Container className="py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-brand-blue">{eventTypeLabel(event.type)}</span>
          <EventStatusChip status={event.status} />
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{event.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{event.summary}</p>
        {open && event.registrationUrl ? (
          <div className="mt-8">
            <ButtonLink href={event.registrationUrl} external emphasis>Register <ArrowUpRight /></ButtonLink>
          </div>
        ) : null}
        <Cover src={event.image} title={event.title} label={eventTypeLabel(event.type)} priority sizes="(min-width: 1152px) 1100px, 100vw" className="mt-12 rounded-lg border border-border sm:aspect-[21/9]" />
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-12">
        <div className="lg:col-span-8"><Markdown>{event.content}</Markdown></div>
        {facts.length > 0 ? (
          <aside className="lg:col-span-4" aria-label="Event details">
            <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[1rem_1fr] gap-x-3 px-5 py-4 text-sm">
                  <dt className="contents">
                    <f.icon aria-hidden="true" className="mt-0.5 size-4 text-brand-blue" />
                    <span className="text-muted-foreground">{f.label}</span>
                  </dt>
                  <dd className="col-start-2 mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        ) : null}
      </Container>
    </>
  );
}
