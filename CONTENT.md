# Editing site content

Trojans PK currently has no database or admin panel. Everything on the site comes from
files in this repository. To change something, edit the file, check it locally, and
deploy. Pages refresh in the background at most once an hour (ISR).

Every content file is **validated when the site builds**. A typo (bad URL, unknown
category, duplicate slug, missing field) stops the build with a message that names
the file and the problem, so broken content cannot be published.

## Where things live

| What | File |
| --- | --- |
| Social links, community invite links, email | `src/config/social-links.ts` |
| Site name, URL, membership application form link | `src/config/site.ts` |
| Projects | `src/data/projects.ts` |
| Events | `src/data/events.ts` |
| Team members | `src/data/team.ts` |
| Featured achievement | `src/data/achievements.ts` |
| Homepage statistics | `src/data/stats.ts` |
| Testimonials | `src/data/testimonials.ts` |
| Blog articles | `content/blog/*.md` |
| Images | `public/` (reference as `/images/...`) |
| About / Community / Join page wording | `src/config/copy.ts` |

## Previewing

```bash
npm run dev     # http://localhost:3000, hot reload, drafts are visible
```

Drafts (`published: false` / `draft: true`) appear **only** in `npm run dev`. They are
never included in `npm run build`.

## Social and community links

Edit `src/config/social-links.ts`. One change updates the navbar, hero, footer, Community
page and Join page.

- Change a `url` to update a link everywhere.
- Array order is display order.
- `url: null` (or `isVisible: false`) hides the platform. Facebook, YouTube, X, TikTok,
  email and website are already listed and appear as soon as you add a URL.
- For `email`, use an address such as `hello@example.com` (the site adds `mailto:`).
- `isInvite: true` shows the platform as a "Join" card with a copy-link button.

## Membership applications

The site cannot store applications. Create a form with an external service (for example
Google Forms) and paste its link into `applicationFormUrl` in `src/config/site.ts`.
Until it is set, the Join page hides the Apply button and points to the community channels.
Keep the question list in `joinCopy.applicationFields` (`src/config/copy.ts`) in sync with the form.

## Projects

Add an object to the array in `src/data/projects.ts`:

```ts
{
  slug: "my-project",            // URL: /projects/my-project (lowercase, hyphens)
  title: "My Project",
  summary: "One sentence (max 300 characters).",
  content: "Markdown description shown on the detail page.",
  coverImage: "/images/projects/my-project.jpg", // or null
  categorySlug: "web",           // ai-ml | web | mobile | open-source | developer-tools | other
  technologies: ["Next.js", "PostgreSQL"],
  contributors: [{ name: "Name", url: "https://github.com/name" }],
  githubUrl: "https://github.com/trojan-pk/my-project", // or null
  liveUrl: null,
  status: "COMPLETED",           // IN_DEVELOPMENT | COMPLETED | MAINTAINED | ARCHIVED | null
  badge: null,                   // short highlight such as "National Finalist"
  isFeatured: false,
  published: true,               // false = draft
  publishedAt: new Date("2026-11-01"),
}
```

Only add information you can verify. `null` / empty values are hidden on the page.

## Events

Add to `src/data/events.ts`. Key fields: `type` (`HACKATHON`, `WORKSHOP`, `TECH_SESSION`,
`MEETUP`, `COMPETITION`, `GATHERING`), `startsAt`, `location`, `organizer`, `registrationUrl`
and `status`.

**Upcoming vs previous is controlled by `status`**, not by today's date (pages are
rendered ahead of time and refreshed hourly). Set `UPCOMING` or `ONGOING` to list it under "Upcoming", and change
it to `COMPLETED` (or `CANCELLED`) after the event, then redeploy.

## Team

Edit `src/data/team.ts`. Put profile photos in `public/images/team/` and set
`photo: "/images/team/name.jpg"`. Links set to `null` are hidden. `order` controls the sequence.

## Blog articles

1. Copy `content/blog/_template.md` to a new file, e.g. `content/blog/my-first-post.md`.
   The file name is the URL (`/blog/my-first-post`) and must be lowercase with hyphens.
2. Fill in the front matter and write the article in Markdown (raw HTML is not rendered).
3. Set `draft: false` (or remove the line) to publish.

Categories: `software-engineering`, `ai-ml`, `open-source`, `hackathon-experiences`,
`tutorials`, `announcements`. Use `authorSlug` with a team member slug to link the author
to their profile on `/team`. Reading time is calculated automatically.

## Statistics and testimonials

- **Stats** (`src/data/stats.ts`): replace `null` with a real, verified number. The
  "Community impact" section appears only when at least one value is set.
- **Testimonials** (`src/data/testimonials.ts`): add only genuine feedback shared with
  the member's permission. The section appears only when the list is not empty.

## Images

Put files in `public/` and reference them by path, always through `next/image`. Next.js
resizes them and serves AVIF/WebP, so upload a sensible original (roughly 2000 px wide at
most, under 1 MB). Add `sizes` to `fill` images and `priority` to the main above-the-fold image.

## Checking your work

```bash
npm run lint
npm run typecheck
npm run build        # validates all content and creates the production build
npm run check:site   # starts the site and audits links, SEO, structured data and headers
```
