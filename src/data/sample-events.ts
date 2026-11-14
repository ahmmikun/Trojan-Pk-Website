import type { CommunityEvent } from "@/types/content";

/**
 * SAMPLE EVENTS: placeholder content for designing and reviewing the site.
 * These events did not happen. They are shown only in development and on
 * Vercel preview deployments, never on production (see src/content/visibility.ts).
 * Delete this file (and public/samples/) once real events exist.
 *
 * Photos: Unsplash (https://unsplash.com/license), stored in public/samples/events/.
 */
const sample = (e: Omit<CommunityEvent, "endsAt" | "dateLabel" | "organizer" | "registrationUrl" | "isFeatured" | "published">): CommunityEvent => ({
  endsAt: null,
  dateLabel: null,
  organizer: "Trojans PK (sample)",
  registrationUrl: null,
  isFeatured: false,
  published: true,
  ...e,
});

export const sampleEventsData: CommunityEvent[] = [
  sample({
    slug: "sample-build-weekend-hackathon",
    title: "Build Weekend",
    summary: "Sample event. A 36-hour hackathon where small teams take an idea from sketch to working demo.",
    content: "**Sample event.** This placeholder shows how a hackathon page looks with a cover image.",
    type: "HACKATHON",
    image: "/samples/events/hackathon.jpg",
    startsAt: new Date("2027-01-23T09:00:00+05:00"),
    location: "Lahore, Pakistan",
    status: "UPCOMING",
  }),
  sample({
    slug: "sample-open-source-sprint",
    title: "Open Source Sprint",
    summary: "Sample event. Pair up with maintainers and land your first pull requests in real projects.",
    content: "**Sample event.** This placeholder shows how a workshop page looks with a cover image.",
    type: "WORKSHOP",
    image: "/samples/events/coding.jpg",
    startsAt: new Date("2027-02-13T11:00:00+05:00"),
    location: "Online",
    status: "UPCOMING",
  }),
  sample({
    slug: "sample-ai-in-production-talk",
    title: "AI in Production",
    summary: "Sample event. Engineers share what it takes to ship and run machine-learning features.",
    content: "**Sample event.** This placeholder shows how a technical session page looks with a cover image.",
    type: "TECH_SESSION",
    image: "/samples/events/conference.jpg",
    startsAt: new Date("2026-09-12T17:00:00+05:00"),
    location: "Islamabad, Pakistan",
    status: "COMPLETED",
  }),
  sample({
    slug: "sample-builders-meetup",
    title: "Builders Meetup",
    summary: "Sample event. An evening of demos, feedback and conversation between members.",
    content: "**Sample event.** This placeholder shows how a meetup page looks with a cover image.",
    type: "MEETUP",
    image: "/samples/events/meetup.jpg",
    startsAt: new Date("2026-08-02T18:00:00+05:00"),
    location: "Karachi, Pakistan",
    status: "COMPLETED",
  }),
  sample({
    slug: "sample-lightning-talks",
    title: "Lightning Talks",
    summary: "Sample event. Five-minute talks from members on tools, projects and lessons learned.",
    content: "**Sample event.** This placeholder shows how a community gathering page looks with a cover image.",
    type: "GATHERING",
    image: "/samples/events/talk.jpg",
    startsAt: new Date("2026-06-20T18:30:00+05:00"),
    location: "Lahore, Pakistan",
    status: "COMPLETED",
  }),
  sample({
    slug: "sample-product-design-clinic",
    title: "Product Design Clinic",
    summary: "Sample event. Bring a screen you are stuck on and work through it with designers and engineers.",
    content: "**Sample event.** This placeholder shows how a workshop page looks with a cover image.",
    type: "WORKSHOP",
    image: "/samples/events/workshop.jpg",
    startsAt: new Date("2026-05-09T15:00:00+05:00"),
    location: "Online",
    status: "COMPLETED",
  }),
];
