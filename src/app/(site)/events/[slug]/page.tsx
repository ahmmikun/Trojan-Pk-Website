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
import { EventGallery } from "@/features/events/event-gallery";
import { eventDateLabel } from "@/lib/format";
import { getEventBySlug, getEvents } from "@/content/events";
import { absoluteUrl, detailMetadata } from "@/lib/seo";

// Known slugs are prerendered at build time. Others render on demand; notFound() handles unknown ones.
export const revalidate = 3600;

export async function generateStaticParams() {
  const { upcoming, past } = await getEvents();
  return [...upcoming, ...past].map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  if (!event) return {};
  return detailMetadata({ path: `/events/${event.slug}`, title: event.title, description: event.summary, image: event.image ?? event.gallery?.[0]?.src ?? null, seo: event.seo, isSample: event.isSample });
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const { upcoming, past } = await getEvents();
  const more = [...upcoming, ...past].filter((e) => e.slug !== event.slug).slice(0, 2);

  const date = eventDateLabel(event);
  const photos = event.gallery ?? [];
  const images = [event.image, ...photos.map((p) => p.src)].filter((s): s is string => Boolean(s)).slice(0, 10);
  const open = event.status === "UPCOMING" || event.status === "ONGOING";
  const facts = [
    { label: "Type", value: eventTypeLabel(event.type) },
    date && { label: "Date", value: date },
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
          eventAttendanceMode: event.location?.toLowerCase() === "online" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
          ...(images.length ? { image: images.map((src) => absoluteUrl(siteConfig.url, src)) } : {}),
          ...(event.location ? { location: event.location.toLowerCase() === "online" ? { "@type": "VirtualLocation", url: `${siteConfig.url}/events/${event.slug}` } : { "@type": "Place", name: event.location, address: event.location } } : {}),
          organizer: { "@type": "Organization", name: event.organizer ?? siteConfig.name, url: siteConfig.url },
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
        cover={{ src: event.image ?? photos[0]?.src ?? null, title: event.title, label: eventTypeLabel(event.type) }}
      />

      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Markdown className="text-lg leading-[1.6]">{event.content}</Markdown>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <DetailAside label="Event details" items={facts} />
        </div>
      </Container>

      {photos.length > 0 ? (
        <Section id="photos" aria-labelledby="photos-heading">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Gallery" title={<span id="photos-heading">Photos from the event</span>} />
            <p className="text-sm text-muted-foreground tabular-nums">{photos.length} {photos.length === 1 ? "photo" : "photos"}</p>
          </div>
          <div className="mt-12 sm:mt-16">
            <EventGallery photos={photos} title={event.title} />
          </div>
        </Section>
      ) : null}

      {more.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Events" title="More from the community" />
          <MediaGrid className="mt-16" items={more.map(eventToMedia)} />
        </Section>
      ) : null}
    </>
  );
}
