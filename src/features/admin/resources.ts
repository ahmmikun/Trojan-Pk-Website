import { BLOG_CATEGORIES, EVENT_TYPES, PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECT_STATUS_LABEL } from "@/types/content";
import { SOCIAL_PLATFORMS } from "@/types/social";

/**
 * Admin resource registry. One entry per content table describes the editor layout
 * (sections, inspector, SEO tab), list columns and tabs, and where the item lives on
 * the public site. Pages, forms and Server Actions are generated from this, so a new
 * field is: add the column (migration) + add it here.
 */

export type Option = { value: string; label: string };

export type SubField = { name: string; label: string; type: "text" | "url" | "date" | "image"; placeholder?: string; width?: "narrow" | "wide" };

export type FieldType = "text" | "slug" | "textarea" | "markdown" | "url" | "email" | "select" | "boolean" | "datetime" | "number" | "tags" | "image" | "repeater";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  placeholder?: string;
  maxLength?: number;
  options?: Option[];
  /** Repeater only: the columns of each row. */
  fields?: SubField[];
  /** Two per row on wide screens. */
  half?: boolean;
  min?: number;
  max?: number;
  /** Where the field renders: a main-column section id, "inspector" (right column) or "seo". */
  place: string;
  /** Larger text for the document title. */
  prominent?: boolean;
  /** Extra server-side rule; return an error message or null. */
  validate?: (value: string) => string | null;
};

export type Section = { id: string; title: string; description?: string };

export type ListColumn = { name: string; label: string; kind?: "text" | "date" | "option" | "number"; hideBelow?: "md" | "lg" | "xl"; align?: "right" };

export type ListTab = { id: string; label: string; filter: { column: string; op: "eq" | "in"; value: unknown }[] };

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  /** `uuid` ids are generated; `key` ids are chosen by the admin (stats, social links). */
  idColumn: string;
  idKind: "uuid" | "key";
  titleField: string;
  imageField?: string;
  /** Muted line under the title in lists, e.g. "Lahore · Workshop". */
  subtitle?: (row: Row) => string | null;
  columns: ListColumn[];
  tabs?: ListTab[];
  sections: Section[];
  fields: Field[];
  /** Adds the SEO tab (seo_title, seo_description, seo_image, noindex) and search previews. */
  seo?: boolean;
  publicPath?: (row: Row) => string | null;
  /** Manual order (sort_order) is the primary sort. */
  ordered?: boolean;
  /** Shown in the sidebar group. */
  group: "content" | "community";
};

export type Row = Record<string, unknown>;

const opts = <T extends { value?: string; slug?: string; label?: string; name?: string }>(list: readonly T[]): Option[] =>
  list.map((o) => ({ value: (o.value ?? o.slug)!, label: (o.label ?? o.name)! }));

const EVENT_STATUS: Option[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Happening now" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

/* Shared inspector fields */
const published = (description = "Visible on the public site."): Field => ({ name: "published", label: "Published", type: "boolean", place: "inspector", description });
const featured = (description?: string): Field => ({ name: "is_featured", label: "Featured", type: "boolean", place: "inspector", description });
const slug = (prefix: string): Field => ({ name: "slug", label: "URL", type: "slug", required: true, place: "inspector", placeholder: prefix, description: "Lowercase letters, numbers and hyphens." });
const order: Field = { name: "sort_order", label: "Display order", type: "number", place: "inspector", min: -1000, max: 1000, description: "Lower numbers appear first." };

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
const join = (...parts: unknown[]) => parts.map(str).filter(Boolean).join(" · ") || null;
const label = (list: Option[], v: unknown) => list.find((o) => o.value === v)?.label ?? null;

export const SEO_FIELDS: Field[] = [
  { name: "seo_title", label: "Meta title", type: "text", maxLength: 70, place: "seo", description: "Shown as the search result title. Keep it under 60 characters. Leave empty to use the title." },
  { name: "seo_description", label: "Meta description", type: "textarea", maxLength: 200, place: "seo", description: "The snippet under the title in search results. 120–155 characters works best. Leave empty to use the summary." },
  { name: "seo_image", label: "Social image", type: "image", place: "seo", description: "Used when the page is shared. 1200×630 works best. Falls back to the cover image." },
  { name: "noindex", label: "Hide from search engines", type: "boolean", place: "seo", description: "Adds noindex and removes the page from the sitemap." },
];

export const RESOURCES: Record<string, Resource> = {
  events: {
    key: "events",
    table: "events",
    label: "Events",
    singular: "Event",
    description: "Hackathons, workshops, sessions and meetups.",
    group: "content",
    idColumn: "id",
    idKind: "uuid",
    titleField: "title",
    imageField: "image",
    seo: true,
    subtitle: (r) => join(label(opts(EVENT_TYPES), r.type), r.location),
    columns: [
      { name: "status", label: "Status", kind: "option" },
      { name: "starts_at", label: "Date", kind: "date", hideBelow: "lg" },
    ],
    tabs: [
      { id: "upcoming", label: "Upcoming", filter: [{ column: "status", op: "in", value: ["UPCOMING", "ONGOING"] }] },
      { id: "past", label: "Past", filter: [{ column: "status", op: "in", value: ["COMPLETED", "CANCELLED"] }] },
    ],
    publicPath: (r) => `/events/${r.slug}`,
    sections: [
      { id: "basics", title: "Basics" },
      { id: "media", title: "Cover image", description: "Shown on the events grid and at the top of the event page." },
      { id: "content", title: "Description" },
      { id: "details", title: "When and where" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, place: "basics", prominent: true },
      { name: "summary", label: "Summary", type: "textarea", maxLength: 400, place: "basics", description: "One or two sentences for cards and link previews." },
      { name: "image", label: "Cover image", type: "image", place: "media" },
      { name: "content", label: "Event details", type: "markdown", place: "content", description: "Agenda, speakers, what to bring." },
      { name: "type", label: "Type", type: "select", required: true, options: opts(EVENT_TYPES), half: true, place: "details" },
      { name: "status", label: "Status", type: "select", required: true, options: EVENT_STATUS, half: true, place: "details", description: "Upcoming and Happening now list under upcoming events." },
      { name: "starts_at", label: "Starts", type: "datetime", half: true, place: "details" },
      { name: "ends_at", label: "Ends", type: "datetime", half: true, place: "details" },
      { name: "location", label: "Location", type: "text", half: true, place: "details", placeholder: "Lahore, Pakistan or Online" },
      { name: "date_label", label: "Date label", type: "text", half: true, place: "details", description: "Optional, for dates that are not fixed yet, e.g. “Spring 2027”." },
      { name: "organizer", label: "Organizer", type: "text", half: true, place: "details" },
      { name: "registration_url", label: "Registration link", type: "url", half: true, place: "details" },
      published(),
      featured("Highlighted on the home page."),
      slug("/events/"),
      { name: "is_sample", label: "Sample content", type: "boolean", place: "inspector", description: "Placeholder. Never indexed; hidden when HIDE_SAMPLE_CONTENT=1." },
      order,
    ],
  },
  projects: {
    key: "projects",
    table: "projects",
    label: "Projects",
    singular: "Project",
    description: "What members have built.",
    group: "content",
    idColumn: "id",
    idKind: "uuid",
    titleField: "title",
    imageField: "cover_image",
    seo: true,
    subtitle: (r) => join(label(opts(PROJECT_CATEGORIES), r.category_slug), r.badge),
    columns: [{ name: "status", label: "Stage", kind: "option", hideBelow: "lg" }],
    publicPath: (r) => `/projects/${r.slug}`,
    sections: [
      { id: "basics", title: "Basics" },
      { id: "media", title: "Cover image" },
      { id: "content", title: "Write-up" },
      { id: "details", title: "Details" },
      { id: "people", title: "Contributors" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, place: "basics", prominent: true },
      { name: "summary", label: "Summary", type: "textarea", maxLength: 400, place: "basics" },
      { name: "cover_image", label: "Cover image", type: "image", place: "media" },
      { name: "content", label: "Project write-up", type: "markdown", place: "content" },
      { name: "category_slug", label: "Category", type: "select", required: true, options: opts(PROJECT_CATEGORIES), half: true, place: "details" },
      { name: "status", label: "Stage", type: "select", options: PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABEL[s] })), half: true, place: "details", description: "Leave empty to hide." },
      { name: "technologies", label: "Technologies", type: "tags", place: "details", placeholder: "Next.js, Supabase, Python" },
      { name: "github_url", label: "Repository", type: "url", half: true, place: "details" },
      { name: "live_url", label: "Live demo", type: "url", half: true, place: "details" },
      { name: "badge", label: "Badge", type: "text", half: true, place: "details", placeholder: "National Finalist" },
      { name: "published_at", label: "Launch date", type: "datetime", half: true, place: "details" },
      { name: "contributors", label: "Contributors", type: "repeater", place: "people", fields: [{ name: "name", label: "Name", type: "text" }, { name: "url", label: "Profile link", type: "url", width: "wide" }] },
      published(),
      featured("Shown on the home page."),
      slug("/projects/"),
      order,
    ],
  },
  blog: {
    key: "blog",
    table: "blog_posts",
    label: "Blog",
    singular: "Post",
    description: "Articles. Markdown files in content/blog keep working alongside.",
    group: "content",
    idColumn: "id",
    idKind: "uuid",
    titleField: "title",
    imageField: "cover_image",
    seo: true,
    subtitle: (r) => join(label(opts(BLOG_CATEGORIES), r.category_slug), r.author_name),
    columns: [{ name: "published_at", label: "Date", kind: "date", hideBelow: "lg" }],
    publicPath: (r) => `/blog/${r.slug}`,
    sections: [
      { id: "basics", title: "Basics" },
      { id: "media", title: "Cover image" },
      { id: "content", title: "Article" },
      { id: "details", title: "Details" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, place: "basics", prominent: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, maxLength: 300, place: "basics", description: "Shown in the blog list and link previews." },
      { name: "cover_image", label: "Cover image", type: "image", place: "media" },
      { name: "content", label: "Article", type: "markdown", required: true, place: "content" },
      { name: "category_slug", label: "Category", type: "select", required: true, options: opts(BLOG_CATEGORIES), half: true, place: "details" },
      { name: "tags", label: "Tags", type: "tags", half: true, place: "details" },
      { name: "author_name", label: "Author", type: "text", required: true, half: true, place: "details" },
      { name: "author_slug", label: "Author profile", type: "text", half: true, place: "details", description: "Team member slug, e.g. talha-irfan. Optional." },
      { name: "published_at", label: "Publish date", type: "datetime", required: true, half: true, place: "details" },
      { name: "content_updated_at", label: "Last revised", type: "datetime", half: true, place: "details", description: "Shown as “Updated” on the article." },
      published(),
      { name: "featured", label: "Featured", type: "boolean", place: "inspector" },
      slug("/blog/"),
    ],
  },
  achievements: {
    key: "achievements",
    table: "achievements",
    label: "Achievements",
    singular: "Achievement",
    description: "The highlighted result on the home page.",
    group: "content",
    idColumn: "id",
    idKind: "uuid",
    titleField: "title",
    subtitle: (r) => join(r.badge, r.project_name),
    columns: [],
    publicPath: () => "/",
    sections: [
      { id: "basics", title: "Basics" },
      { id: "project", title: "Project", description: "Links to the project and event pages when the slugs match." },
      { id: "timeline", title: "Timeline" },
      { id: "media", title: "Photos and links" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, place: "basics", prominent: true },
      { name: "subtitle", label: "Subtitle", type: "text", half: true, place: "basics" },
      { name: "badge", label: "Badge", type: "text", half: true, place: "basics" },
      { name: "description", label: "Description", type: "textarea", maxLength: 800, place: "basics" },
      { name: "project_name", label: "Project name", type: "text", half: true, place: "project" },
      { name: "project_slug", label: "Project slug", type: "text", half: true, place: "project", placeholder: "bolkhata" },
      { name: "project_summary", label: "Project summary", type: "textarea", maxLength: 600, place: "project" },
      { name: "event_slug", label: "Event slug", type: "text", place: "project" },
      { name: "timeline", label: "Milestones", type: "repeater", place: "timeline", fields: [{ name: "label", label: "Label", type: "text" }, { name: "date", label: "Date", type: "date" }, { name: "title", label: "Title", type: "text", width: "wide" }, { name: "detail", label: "Detail", type: "text", width: "wide" }] },
      { name: "images", label: "Photos", type: "repeater", place: "media", fields: [{ name: "src", label: "Image", type: "image" }, { name: "alt", label: "Alt text", type: "text", width: "wide" }] },
      { name: "links", label: "Links", type: "repeater", place: "media", fields: [{ name: "label", label: "Label", type: "text" }, { name: "url", label: "Link", type: "url", width: "wide" }] },
      published(),
      slug("/"),
      order,
    ],
  },
  team: {
    key: "team",
    table: "team_members",
    label: "Team",
    singular: "Team member",
    description: "People on the Team page, in display order.",
    group: "community",
    idColumn: "id",
    idKind: "uuid",
    titleField: "name",
    imageField: "photo",
    ordered: true,
    subtitle: (r) => str(r.role),
    columns: [{ name: "sort_order", label: "Order", kind: "number", hideBelow: "md", align: "right" }],
    publicPath: () => "/team",
    sections: [
      { id: "basics", title: "Profile" },
      { id: "media", title: "Photo", description: "Square or portrait, at least 800px wide." },
      { id: "links", title: "Links" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 120, half: true, place: "basics", prominent: true },
      { name: "role", label: "Role", type: "text", required: true, maxLength: 120, half: true, place: "basics" },
      { name: "bio", label: "Bio", type: "textarea", maxLength: 800, place: "basics" },
      { name: "interests", label: "Interests", type: "tags", place: "basics", placeholder: "AI & Machine Learning, Open Source" },
      { name: "photo", label: "Photo", type: "image", place: "media" },
      { name: "github", label: "GitHub", type: "url", half: true, place: "links" },
      { name: "linkedin", label: "LinkedIn", type: "url", half: true, place: "links" },
      { name: "website", label: "Website", type: "url", half: true, place: "links" },
      { name: "other_links", label: "Other links", type: "repeater", place: "links", fields: [{ name: "label", label: "Label", type: "text" }, { name: "url", label: "Link", type: "url", width: "wide" }] },
      published("Shown on the Team page."),
      slug("/team#"),
      order,
    ],
  },
  partners: {
    key: "partners",
    table: "partners",
    label: "Partners",
    singular: "Partner",
    description: "Organisations in the collaborations section.",
    group: "community",
    idColumn: "id",
    idKind: "uuid",
    titleField: "name",
    imageField: "logo",
    ordered: true,
    subtitle: (r) => join(r.short, r.detail),
    columns: [
      { name: "year", label: "Year", kind: "number", hideBelow: "md", align: "right" },
      { name: "sort_order", label: "Order", kind: "number", hideBelow: "lg", align: "right" },
    ],
    publicPath: () => "/#collaborations",
    sections: [
      { id: "basics", title: "Organisation" },
      { id: "media", title: "Logo", description: "Optional. Check the organisation's brand guidelines first. The name is shown as a wordmark when empty." },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 120, half: true, place: "basics", prominent: true },
      { name: "short", label: "Short name", type: "text", maxLength: 20, half: true, place: "basics", placeholder: "GDG" },
      { name: "detail", label: "What we did together", type: "text", maxLength: 200, place: "basics", placeholder: "Co-hosted DevFest Lahore 2025" },
      { name: "year", label: "Year", type: "number", min: 2000, max: 2100, half: true, place: "basics" },
      { name: "url", label: "Website", type: "url", half: true, place: "basics" },
      { name: "logo", label: "Logo", type: "image", place: "media" },
      published(),
      slug("id: "),
      order,
    ],
  },
  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Member quotes, published with their permission.",
    group: "community",
    idColumn: "id",
    idKind: "uuid",
    titleField: "name",
    imageField: "avatar",
    subtitle: (r) => (str(r.quote) ? `“${String(r.quote).slice(0, 80)}${String(r.quote).length > 80 ? "…" : ""}”` : null),
    columns: [{ name: "role", label: "Role", hideBelow: "lg" }],
    publicPath: () => "/",
    sections: [
      { id: "basics", title: "Quote" },
      { id: "media", title: "Photo" },
    ],
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true, maxLength: 1000, place: "basics" },
      { name: "name", label: "Name", type: "text", required: true, half: true, place: "basics", prominent: false },
      { name: "role", label: "Role", type: "text", half: true, place: "basics", placeholder: "Student, Lahore" },
      { name: "avatar", label: "Photo", type: "image", place: "media" },
      published("Only publish with the member's permission."),
      order,
    ],
  },
  stats: {
    key: "stats",
    table: "stats",
    label: "Stats",
    singular: "Stat",
    description: "Community numbers on the home page. Empty values stay hidden.",
    group: "community",
    idColumn: "key",
    idKind: "key",
    titleField: "label",
    ordered: true,
    subtitle: (r) => (r.value === null || r.value === undefined ? "No value: hidden on the site" : null),
    columns: [{ name: "value", label: "Value", kind: "number", align: "right" }],
    publicPath: () => "/",
    sections: [{ id: "basics", title: "Stat" }],
    fields: [
      { name: "label", label: "Label", type: "text", required: true, half: true, place: "basics", prominent: false },
      { name: "value", label: "Value", type: "number", min: 0, max: 100000000, half: true, place: "basics", description: "Real, verified numbers only. Leave empty to hide." },
      { name: "suffix", label: "Suffix", type: "text", maxLength: 4, half: true, place: "basics", placeholder: "+" },
      { name: "key", label: "Key", type: "slug", required: true, place: "inspector", description: "Unique id. Cannot be changed after creation." },
      published(),
      order,
    ],
  },
  social: {
    key: "social",
    table: "social_links",
    label: "Social links",
    singular: "Social link",
    description: "Community invites and profiles in the navbar, hero, footer and Join page.",
    group: "community",
    idColumn: "id",
    idKind: "key",
    titleField: "label",
    ordered: true,
    subtitle: (r) => str(r.url) ?? "No link: hidden on the site",
    columns: [{ name: "platform", label: "Platform", kind: "option", hideBelow: "md" }],
    sections: [{ id: "basics", title: "Link" }],
    fields: [
      { name: "label", label: "Label", type: "text", required: true, maxLength: 80, half: true, place: "basics", placeholder: "Discord Server" },
      { name: "platform", label: "Platform", type: "select", required: true, half: true, place: "basics", options: SOCIAL_PLATFORMS.map((p) => ({ value: p, label: p === "x" ? "X (Twitter)" : p[0].toUpperCase() + p.slice(1) })) },
      { name: "url", label: "Link or email", type: "text", maxLength: 500, place: "basics", placeholder: "https://… (or an address for Email)", description: "Leave empty to hide this platform.", validate: (v) => (/^https:\/\/\S+$/.test(v) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "Use a full https:// link, or an email address.") },
      { name: "is_invite", label: "Community invite", type: "boolean", place: "basics", description: "Shown as a join card with a copy button (WhatsApp, Discord, Telegram)." },
      { name: "description", label: "Card text", type: "textarea", maxLength: 200, place: "basics", description: "One line on the invite card." },
      { name: "id", label: "Key", type: "slug", required: true, place: "inspector", description: "Unique id. Cannot be changed after creation." },
      published("Visible on the site when it has a link."),
      order,
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function getResource(key: string): Resource | null {
  return Object.hasOwn(RESOURCES, key) ? RESOURCES[key] : null;
}

/** Every field of a resource, including the generated SEO fields. */
export function allFields(r: Resource): Field[] {
  return r.seo ? [...r.fields, ...SEO_FIELDS] : r.fields;
}

export function optionLabel(r: Resource, field: string, value: unknown): string | null {
  return allFields(r).find((f) => f.name === field)?.options?.find((o) => o.value === value)?.label ?? (value ? String(value) : null);
}

/** Image columns per table, for media usage checks before deleting a file. */
export function imageColumns(r: Resource): string[] {
  return allFields(r).filter((f) => f.type === "image").map((f) => f.name);
}
