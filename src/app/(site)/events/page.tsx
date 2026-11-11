import type { Metadata } from "next";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { EventCard } from "@/features/events/event-card";
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

      <Section bordered={false} id="upcoming">
        <SectionHeading eyebrow="Upcoming" title="What is next" />
        {upcoming.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.slug}><EventCard event={e} /></li>
            ))}
          </ul>
        ) : (
          <EmptyState className="mt-10" title="No upcoming events right now" description="New events are announced in our community channels first.">
            <SocialIconLinks links={invites} aria-label="Community channels" />
          </EmptyState>
        )}
      </Section>

      <Section id="previous" className="bg-surface">
        <SectionHeading eyebrow="Previous" title="Where we have been" />
        {past.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <li key={e.slug}><EventCard event={e} /></li>
            ))}
          </ul>
        ) : (
          <EmptyState className="mt-10" title="No previous events yet" />
        )}
      </Section>
    </>
  );
}
