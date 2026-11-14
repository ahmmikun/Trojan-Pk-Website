import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";
import { DetailAside, DetailHeader } from "@/components/common/detail-header";
import { JsonLd } from "@/components/common/json-ld";
import { MediaGrid } from "@/components/common/media-grid";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
import { siteConfig } from "@/config/site";
import { EventStatusChip, eventToMedia, eventTypeLabel } from "@/features/events/event-card";
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

  const { upcoming, past } = await getEvents();
  const more = [...upcoming, ...past].filter((e) => e.slug !== event.slug).slice(0, 2);

  const date = eventDateLabel(event);
  const open = event.status === "UPCOMING" || event.status === "ONGOING";
  const facts = [
    { label: "Type", value: eventTypeLabel(event.type) },
    date && { label: "Date and time", value: date },
    event.location && { label: "Location", value: event.location },
    event.organizer && { label: "Organizer", value: event.organizer },
  ].filter(Boolean) as { label: string; value: string }[];

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
      <DetailHeader
        back={{ href: "/events", label: "All events" }}
        meta={
          <>
            <span>{eventTypeLabel(event.type)}</span>
            <EventStatusChip status={event.status} />
            {date ? <span className="tabular">· {date}</span> : null}
          </>
        }
        title={event.title}
        summary={event.summary}
        actions={open && event.registrationUrl ? <ButtonLink href={event.registrationUrl} external emphasis>Register <ArrowUpRight /></ButtonLink> : undefined}
        cover={{ src: event.image, title: event.title, label: eventTypeLabel(event.type) }}
      />

      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Markdown className="text-lg leading-[1.6]">{event.content}</Markdown>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <DetailAside label="Event details" items={facts} />
        </div>
      </Container>

      {more.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Events" title="More from the community" />
          <MediaGrid className="mt-16" items={more.map(eventToMedia)} />
        </Section>
      ) : null}
    </>
  );
}
