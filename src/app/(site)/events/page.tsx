import type { Metadata } from "next";
import { EmptyState } from "@/components/common/empty-state";
import { MediaGrid } from "@/components/common/media-grid";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { eventToMedia } from "@/features/events/event-card";
import { getEvents } from "@/content/events";
import { getInviteLinks } from "@/content/social";
import { EVENT_TYPES } from "@/types/content";

export const metadata: Metadata = {
  title: "Events",
  description: "Hackathons, workshops, technical sessions, meetups and competitions from the Trojans PK community.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [{ upcoming, past }, invites] = await Promise.all([getEvents(), getInviteLinks()]);

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Meet. Compete. Learn."
        description={`${EVENT_TYPES.map((t) => t.label.toLowerCase()).join(", ")}: where Trojans PK comes together.`}
      />

      <Section bordered={false} id="upcoming" containerSize="wide">
        <SectionHeading eyebrow="Upcoming" title="What is next" />
        {upcoming.length > 0 ? (
          <MediaGrid className="mt-14" items={upcoming.map(eventToMedia)} priorityFirst />
        ) : (
          <EmptyState className="mt-14" title="No upcoming events right now" description="New events are announced in our community channels first.">
            <SocialIconLinks links={invites} aria-label="Community channels" />
          </EmptyState>
        )}
      </Section>

      <Section id="previous" containerSize="wide">
        <SectionHeading eyebrow="Previous" title="Where we have been" />
        {past.length > 0 ? (
          <MediaGrid className="mt-14" items={past.map(eventToMedia)} />
        ) : (
          <EmptyState className="mt-14" title="No previous events yet" />
        )}
      </Section>
    </>
  );
}
