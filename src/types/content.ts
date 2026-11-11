/**
 * Shared content types. Content files in src/data and content/blog are
 * validated against matching Zod schemas (src/content/schemas.ts) at build time.
 */

export const PROJECT_CATEGORIES = [
  { slug: "ai-ml", name: "AI/ML" },
  { slug: "web", name: "Web Development" },
  { slug: "mobile", name: "Mobile Development" },
  { slug: "open-source", name: "Open Source" },
  { slug: "developer-tools", name: "Developer Tools" },
  { slug: "other", name: "Other" },
] as const;

export const PROJECT_STATUSES = ["IN_DEVELOPMENT", "COMPLETED", "MAINTAINED", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  IN_DEVELOPMENT: "In development",
  COMPLETED: "Completed",
  MAINTAINED: "Actively maintained",
  ARCHIVED: "Archived",
};

export type Contributor = { name: string; url?: string | null };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  /** Long-form markdown shown on the detail page. */
  content: string;
  coverImage: string | null;
  categorySlug: (typeof PROJECT_CATEGORIES)[number]["slug"];
  technologies: string[];
  contributors: Contributor[];
  githubUrl: string | null;
  liveUrl: string | null;
  /** Null when the status has not been confirmed. Hidden in the UI. */
  status: ProjectStatus | null;
  /** Short highlight chip, e.g. "National Finalist". */
  badge: string | null;
  isFeatured: boolean;
  /** Set to false to keep the project off the site (draft). */
  published: boolean;
  publishedAt: Date | null;
};

export const EVENT_TYPES = [
  { value: "HACKATHON", label: "Hackathon" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "TECH_SESSION", label: "Technical session" },
  { value: "MEETUP", label: "Meetup" },
  { value: "COMPETITION", label: "Competition" },
  { value: "GATHERING", label: "Community gathering" },
] as const;
export type EventType = (typeof EVENT_TYPES)[number]["value"];

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type CommunityEvent = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  type: EventType;
  image: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  /** Free-form date label for events with imprecise dates. */
  dateLabel: string | null;
  location: string | null;
  organizer: string | null;
  registrationUrl: string | null;
  status: EventStatus;
  isFeatured: boolean;
  /** Set to false to keep the event off the site (draft). */
  published: boolean;
};

export type TeamLink = { label: string; url: string };

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  interests: string[];
  github: string | null;
  linkedin: string | null;
  website: string | null;
  otherLinks: TeamLink[];
  order: number;
};

export const BLOG_CATEGORIES = [
  { slug: "software-engineering", name: "Software Engineering" },
  { slug: "ai-ml", name: "AI & Machine Learning" },
  { slug: "open-source", name: "Open Source" },
  { slug: "hackathon-experiences", name: "Hackathon Experiences" },
  { slug: "tutorials", name: "Tutorials" },
  { slug: "announcements", name: "Community Announcements" },
] as const;

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown. Rendered without raw HTML. */
  content: string;
  coverImage: string | null;
  categorySlug: (typeof BLOG_CATEGORIES)[number]["slug"];
  tags: string[];
  authorName: string;
  /** Matches TeamMember.slug when the author has a profile. */
  authorSlug: string | null;
  publishedAt: Date;
  updatedAt: Date | null;
  featured: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  avatar: string | null;
};

export type Achievement = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  projectName: string;
  projectSummary: string;
  /** Optional links to the showcased project / event detail pages. */
  projectSlug?: string | null;
  eventSlug?: string | null;
  badge: string;
  /** Verified milestones, oldest to newest. */
  timeline: { label: string; title: string; detail: string; date: Date | null }[];
  /** Genuine event photos / screenshots only. */
  images: { src: string; alt: string }[];
  links: { label: string; url: string }[];
};

export type CommunityStat = {
  key: string;
  label: string;
  /** Null hides the stat. Only real, verified numbers should be set. */
  value: number | null;
  suffix?: string;
};
