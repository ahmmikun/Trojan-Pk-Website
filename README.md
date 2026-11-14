# Trojans PK

Website for **Trojans PK**, a Pakistan-based developer and open-source community.
*Learn. Build. Collaborate. Innovate.*

A **server-rendered Next.js app** deployed on Vercel. Pages are prerendered at build time and refreshed
in the background with Incremental Static Regeneration (ISR), images go through the Next.js image
optimizer, and content currently comes from files in this repository. A database is planned; the
content layer in `src/content/` is the single place to swap in a data source.

## Stack

Next.js 16 (App Router, ISR, image optimization) Â· React 19 Â· TypeScript Â· Tailwind CSS 4 Â·
shadcn/ui components (Base UI) Â· Framer Motion Â· Lucide + react-icons Â·
Zod (build-time content validation) Â· gray-matter + react-markdown (blog).
All dependency versions are pinned exactly.

## Getting started

Requires Node.js 20.9 or newer (24 recommended, see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000 (drafts are visible here)
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run build` | Validates all content and creates the production build in `./.next` |
| `npm run check:site` | Starts `next start` and audits it: broken links/anchors/assets, SEO basics, JSON-LD, unsafe links, text encoding, security headers, 404 handling |
| `npm run check:site -- --external` | Same, plus requests every external link (social sites that block bots are reported as "unverifiable") |
| `npm run test:browser` | Real-browser tests on `next start` (phone, tablet and desktop widths): console errors, layout overflow, axe-core accessibility, menu, keyboard, filters, copy-link, reduced motion, no-JS, image optimizer output |
| `npm run test:browser -- --shots` | Same, plus full-page screenshots in `.test-output/` |
| `npm run check` | Everything above (except external links) in one go |

Browser tests use an installed Chrome, Edge or Chromium; set `CHROME_PATH` if it is not found.
Both `check:site` and `test:browser` run against a deployment when `SITE_BASE_URL` is set, for example
`SITE_BASE_URL=https://my-preview.vercel.app npm run check:site`.

## Pages

`/` Â· `/about` Â· `/community` Â· `/projects` (+ detail) Â· `/events` (+ detail) Â· `/team` Â·
`/blog` (+ articles) Â· `/join` Â· `/privacy` Â· `/terms` Â· `sitemap.xml` Â· `robots.txt`

## Project structure

```
content/blog/          Blog articles (Markdown + front matter)
public/                Static files: brand assets, images
scripts/               Post-build fix, site audit, browser tests
src/app/               Routes, layouts, sitemap, robots
src/components/        Shared UI (common, layout, social, ui = shadcn)
src/config/            Site settings, social links, page copy, site URL
src/content/           Content layer: Zod schemas, validation, typed loaders
src/data/              Projects, events, team, achievement, stats, testimonials
src/features/          Page sections grouped by feature (home, projects, blog, ...)
src/lib/               Helpers (formatting, link safety, class names)
src/types/             Shared TypeScript types
```

## Editing content

See **[CONTENT.md](./CONTENT.md)**. In short:

- Social and community links: `src/config/social-links.ts` (one place, updates everywhere)
- Site settings and the membership form link: `src/config/site.ts`
- Projects, events, team, achievement, stats, testimonials: `src/data/*.ts`
- Blog articles: `content/blog/*.md`
- Images: `public/`

Content is validated at build time, and mistakes fail the build with a clear message.
Nothing is invented: unknown details are `null`/empty and hidden until verified data is added.

## Before launch

| Setting | Where | Status |
| --- | --- | --- |
| Public site URL | `NEXT_PUBLIC_SITE_URL` env var in Vercel (see `.env.example`) | **Required** |
| Membership application form link | `applicationFormUrl` in `src/config/site.ts` | Optional. Until set, the Join page points to the community channels |
| Official email | `email` entry in `src/config/social-links.ts` | Optional |
| Team photos, bios and links | `src/data/team.ts` | Optional, hidden until set |
| BolKhata stack, repo, demo, screenshots | `src/data/projects.ts`, `src/data/achievements.ts` | Optional, hidden until set |

**Site URL behaviour.** The URL is used for canonical links, the sitemap, robots.txt and social previews.
If `NEXT_PUBLIC_SITE_URL` is not set, the build uses the URL Vercel provides. On CI or a host with no usable
URL, the build **fails** instead of publishing `localhost` links. Set `ALLOW_LOCALHOST_SITE_URL=1` only for
non-production checks.

## Deployment (Vercel)

1. Import the repository in Vercel (Next.js preset, no extra settings).
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Deploy. Images are optimized by Vercel Image Optimization; security headers come from `next.config.ts`.

Detail pages (`/projects/[slug]`, `/events/[slug]`, `/blog/[slug]`) and the sitemap revalidate every hour
(`export const revalidate = 3600`). Slugs that were not known at build time render on demand.
Any Node host can also run the app with `npm run build && npm run start`.

CI (`.github/workflows/ci.yml`) runs lint, type check, build, the site audit and browser tests on every
push to `main` and every pull request.

### Images

Use `next/image` for every image. Put files in `public/` (local) or add the host to
`images.remotePatterns` in `next.config.ts` (remote). Next.js serves AVIF/WebP at the requested size and
caches results for a year. Only quality 75 is allowed (`images.qualities`). Add `sizes` to `fill` images and
`priority` to the main above-the-fold image.

### Security headers

`next.config.ts` sends HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, COOP and a Content-Security-Policy on every response. `npm run check:site` fails if a
header is missing or a page loads a script from another origin. The CSP allows `'unsafe-inline'` for scripts
and styles because Next.js inlines hydration data; everything else is limited to the site's own origin.
If you add third-party scripts (analytics, embeds), extend the policy there. Verify the headers after your
first deploy (for example with securityheaders.com); they have not yet been tested on a live host.

## Known limitations

- **Upcoming vs previous events** is set by each event's `status`, not by today's date. Update the status
  after an event; the page refreshes within an hour.
- **Dev-only advisory.** `npm audit` reports moderate issues in `minimatch` inside the ESLint
  TypeScript tooling pinned by `eslint-config-next`. It is not part of the built site
  (`npm audit --omit=dev` reports 0). It clears when `eslint-config-next` updates.
- **Browser coverage.** Automated tests run in Chromium. In browsers without CSS scroll-driven animations
  (some Firefox/Safari versions) the scroll reveals simply appear without animating. 
