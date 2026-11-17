import "server-only";
import type { Achievement, BlogPost, CommunityEvent, CommunityStat, DbMeta, Partner, Project, TeamMember, Testimonial } from "@/types/content";
import { SOCIAL_PLATFORMS, type SocialLinkItem } from "@/types/social";
import { readPublished } from "@/lib/supabase/public";
import { showSamples } from "./visibility";

/**
 * Supabase rows → the site's content types. Each loader returns `null` when the database
 * is not configured or unreachable, and the caller then uses the files in src/data.
 * Only published rows are ever returned (enforced by Row Level Security as well).
 */

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const strOrNull = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
const date = (v: unknown) => (typeof v === "string" && v ? new Date(v) : null);
const arr = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const ORDER = [{ column: "sort_order" }, { column: "created_at", ascending: false }];

/** SEO overrides and last-edit time shared by events, projects and posts. */
const meta = (r: Row): DbMeta => ({
  seo: { title: strOrNull(r.seo_title), description: strOrNull(r.seo_description), image: strOrNull(r.seo_image), noindex: Boolean(r.noindex) },
  modifiedAt: date(r.updated_at),
});

export async function dbEvents(): Promise<CommunityEvent[] | null> {
  const rows = await readPublished<Row>("events", ORDER);
  return rows
    ?.filter((r) => showSamples || !r.is_sample)
    .map((r) => ({
      ...meta(r),
      isSample: Boolean(r.is_sample),
      slug: str(r.slug),
      title: str(r.title),
      summary: str(r.summary),
      content: str(r.content),
      type: r.type as CommunityEvent["type"],
      image: strOrNull(r.image),
      startsAt: date(r.starts_at),
      endsAt: date(r.ends_at),
      dateLabel: strOrNull(r.date_label),
      location: strOrNull(r.location),
      organizer: strOrNull(r.organizer),
      registrationUrl: strOrNull(r.registration_url),
      status: r.status as CommunityEvent["status"],
      isFeatured: Boolean(r.is_featured),
      published: true,
    })) ?? null;
}

export async function dbProjects(): Promise<Project[] | null> {
  const rows = await readPublished<Row>("projects", ORDER);
  return rows?.map((r) => ({
    ...meta(r),
    slug: str(r.slug),
    title: str(r.title),
    summary: str(r.summary),
    content: str(r.content),
    coverImage: strOrNull(r.cover_image),
    categorySlug: r.category_slug as Project["categorySlug"],
    technologies: arr<string>(r.technologies),
    contributors: arr<{ name: string; url?: string | null }>(r.contributors).filter((c) => c?.name),
    githubUrl: strOrNull(r.github_url),
    liveUrl: strOrNull(r.live_url),
    status: (r.status as Project["status"]) ?? null,
    badge: strOrNull(r.badge),
    isFeatured: Boolean(r.is_featured),
    published: true,
    publishedAt: date(r.published_at),
  })) ?? null;
}

export async function dbTeam(): Promise<TeamMember[] | null> {
  const rows = await readPublished<Row>("team_members", ORDER);
  return rows?.map((r) => ({
    slug: str(r.slug),
    name: str(r.name),
    role: str(r.role),
    bio: str(r.bio),
    photo: strOrNull(r.photo),
    interests: arr<string>(r.interests),
    github: strOrNull(r.github),
    linkedin: strOrNull(r.linkedin),
    website: strOrNull(r.website),
    otherLinks: arr<{ label: string; url: string }>(r.other_links).filter((l) => l?.label && l?.url),
    order: Number(r.sort_order ?? 0),
  })) ?? null;
}

export async function dbPartners(): Promise<Partner[] | null> {
  const rows = await readPublished<Row>("partners", ORDER);
  return rows?.map((r) => ({
    id: str(r.slug),
    name: str(r.name),
    short: strOrNull(r.short),
    detail: strOrNull(r.detail),
    year: typeof r.year === "number" ? r.year : null,
    url: strOrNull(r.url),
    logo: strOrNull(r.logo),
  })) ?? null;
}

export async function dbTestimonials(): Promise<Testimonial[] | null> {
  const rows = await readPublished<Row>("testimonials", ORDER);
  return rows?.map((r) => ({
    id: str(r.id),
    quote: str(r.quote),
    name: str(r.name),
    role: strOrNull(r.role),
    avatar: strOrNull(r.avatar),
  })) ?? null;
}

export async function dbAchievements(): Promise<Achievement[] | null> {
  const rows = await readPublished<Row>("achievements", ORDER);
  return rows?.map((r) => ({
    slug: str(r.slug),
    title: str(r.title),
    subtitle: str(r.subtitle),
    description: str(r.description),
    projectName: str(r.project_name),
    projectSummary: str(r.project_summary),
    projectSlug: strOrNull(r.project_slug),
    eventSlug: strOrNull(r.event_slug),
    badge: str(r.badge),
    timeline: arr<Row>(r.timeline).map((t) => ({
      label: str(t.label),
      title: str(t.title),
      detail: str(t.detail),
      date: typeof t.date === "string" && t.date ? new Date(t.date.length === 10 ? `${t.date}T00:00:00+05:00` : t.date) : null,
    })),
    images: arr<{ src: string; alt: string }>(r.images).filter((i) => i?.src),
    links: arr<{ label: string; url: string }>(r.links).filter((l) => l?.label && l?.url),
  })) ?? null;
}

export async function dbStats(): Promise<CommunityStat[] | null> {
  const rows = await readPublished<Row>("stats", ORDER);
  return rows?.map((r) => ({
    key: str(r.key),
    label: str(r.label),
    value: typeof r.value === "number" ? r.value : null,
    ...(strOrNull(r.suffix) ? { suffix: str(r.suffix) } : {}),
  })) ?? null;
}

export async function dbPosts(): Promise<BlogPost[] | null> {
  const rows = await readPublished<Row>("blog_posts", [{ column: "published_at", ascending: false }]);
  return rows?.map((r) => ({
    ...meta(r),
    slug: str(r.slug),
    title: str(r.title),
    excerpt: str(r.excerpt),
    content: str(r.content),
    coverImage: strOrNull(r.cover_image),
    categorySlug: r.category_slug as BlogPost["categorySlug"],
    tags: arr<string>(r.tags),
    authorName: str(r.author_name),
    authorSlug: strOrNull(r.author_slug),
    publishedAt: date(r.published_at) ?? new Date(0),
    updatedAt: date(r.content_updated_at),
    featured: Boolean(r.featured),
  })) ?? null;
}


export type SiteSettings = {
  tagline: string;
  description: string;
  applicationFormUrl: string | null;
  contactEmail: string | null;
  defaultOgImage: string | null;
};

export async function dbSiteSettings(): Promise<SiteSettings | null> {
  const rows = await readPublished<Row>("site_settings");
  const r = rows?.[0];
  if (!r) return null;
  return {
    tagline: str(r.tagline),
    description: str(r.description),
    applicationFormUrl: strOrNull(r.application_form_url),
    contactEmail: strOrNull(r.contact_email),
    defaultOgImage: strOrNull(r.default_og_image),
  };
}

/** Social links as the site's SocialLinkItem shape. URLs are validated again at render time (src/lib/social.ts). */
export async function dbSocialLinks(): Promise<SocialLinkItem[] | null> {
  const rows = await readPublished<Row>("social_links", ORDER);
  return (
    rows
      ?.filter((r) => (SOCIAL_PLATFORMS as readonly string[]).includes(str(r.platform)))
      .map((r) => {
        const platform = r.platform as SocialLinkItem["platform"];
        return {
          id: str(r.id),
          platform,
          label: str(r.label),
          url: strOrNull(r.url),
          icon: platform,
          isInvite: Boolean(r.is_invite),
          description: strOrNull(r.description),
          order: Number(r.sort_order ?? 0),
          isVisible: true,
        };
      }) ?? null
  );
}
