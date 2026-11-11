import { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/types/social";
import { BLOG_CATEGORIES, EVENT_TYPES, PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/types/content";

/**
 * Build-time content schemas. Content is edited in plain files, so every entry
 * is validated when the site builds: a typo fails the build with a clear
 * message instead of shipping a broken page.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase letters, numbers and hyphens");

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
const httpUrl = z.string().refine(isHttpUrl, "must be a valid http(s) URL");
const optionalUrl = httpUrl.nullable();
/** Local image path under /public (e.g. "/images/team/ali.jpg") or an https URL. */
const imagePath = z.string().refine((v) => v.startsWith("/") || isHttpUrl(v), 'must start with "/" or be an http(s) URL').nullable();

const categorySlugs = PROJECT_CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const blogCategorySlugs = BLOG_CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const eventTypes = EVENT_TYPES.map((t) => t.value) as [string, ...string[]];

export const projectSchema = z.object({
  slug,
  title: z.string().min(1),
  summary: z.string().min(1).max(300),
  content: z.string().min(1),
  coverImage: imagePath,
  categorySlug: z.enum(categorySlugs),
  technologies: z.array(z.string().min(1)),
  contributors: z.array(z.object({ name: z.string().min(1), url: optionalUrl.optional() })),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  status: z.enum(PROJECT_STATUSES).nullable(),
  badge: z.string().nullable(),
  isFeatured: z.boolean(),
  published: z.boolean(),
  publishedAt: z.date().nullable(),
});

export const eventSchema = z.object({
  slug,
  title: z.string().min(1),
  summary: z.string().min(1).max(300),
  content: z.string().min(1),
  type: z.enum(eventTypes),
  image: imagePath,
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  dateLabel: z.string().nullable(),
  location: z.string().nullable(),
  organizer: z.string().nullable(),
  registrationUrl: optionalUrl,
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
  isFeatured: z.boolean(),
  published: z.boolean(),
});

export const teamMemberSchema = z.object({
  slug,
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  photo: imagePath,
  interests: z.array(z.string().min(1)),
  github: optionalUrl,
  linkedin: optionalUrl,
  website: optionalUrl,
  otherLinks: z.array(z.object({ label: z.string().min(1), url: httpUrl })),
  order: z.number().int(),
});

export const testimonialSchema = z.object({
  id: z.string().min(1),
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().nullable(),
  avatar: imagePath,
});

export const achievementSchema = z.object({
  slug,
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  projectName: z.string().min(1),
  projectSummary: z.string().min(1),
  projectSlug: slug.nullable().optional(),
  eventSlug: slug.nullable().optional(),
  badge: z.string().min(1),
  timeline: z.array(z.object({ label: z.string().min(1), title: z.string().min(1), detail: z.string().min(1), date: z.date().nullable() })),
  images: z.array(z.object({ src: z.string().startsWith("/"), alt: z.string().min(1) })),
  links: z.array(z.object({ label: z.string().min(1), url: httpUrl })),
});

export const statSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.number().int().nonnegative().nullable(),
  suffix: z.string().optional(),
});

export const socialLinkSchema = z.object({
  id: z.string().min(1),
  platform: z.enum(SOCIAL_PLATFORMS),
  label: z.string().min(1),
  /** Validated at render time (http(s) or an email address); empty hides the link. */
  url: z.string().nullable(),
  icon: z.enum(SOCIAL_PLATFORMS),
  isInvite: z.boolean(),
  description: z.string().nullable().optional(),
  order: z.number().int(),
  isVisible: z.boolean(),
});

/** Front matter for content/blog/*.md */
export const blogFrontMatterSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1).max(300),
  category: z.enum(blogCategorySlugs),
  tags: z.array(z.string().min(1)).default([]),
  author: z.string().min(1),
  /** Team member slug, if the author has a profile on /team. */
  authorSlug: slug.optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  cover: z.string().startsWith("/").optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
});
