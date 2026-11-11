# Trojans PK

Website for **Trojans PK**, a Pakistan-based developer and open-source community.
*Learn. Build. Collaborate. Innovate.*

This is a **fully static site**: no backend, no database, no authentication and no admin
panel. All content lives in this repository and is built into plain HTML/CSS/JS that any
static host can serve.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 ·
shadcn/ui components (Base UI) · Framer Motion · Lucide + react-icons ·
Zod (build-time content validation) · gray-matter + react-markdown (blog).
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
| `npm run build` | Validates all content and exports the site to `./out` |
| `npm run check:site` | Audits `./out`: broken links/anchors/assets, SEO basics, JSON-LD, unsafe links, text encoding, CSP drift |
| `npm run check:site -- --external` | Same, plus requests every external link (social sites that block bots are reported as "unverifiable") |
| `npm run test:browser` | Real-browser tests on `./out` (phone, tablet and desktop widths): console errors, layout overflow, axe-core accessibility, menu, keyboard, filters, copy-link, reduced motion, no-JS |
| `npm run test:browser -- --shots` | Same, plus full-page screenshots in `.test-output/` |
| `npm run check` | Everything above (except external links) in one go |

Browser tests use an installed Chrome, Edge or Chromium; set `CHROME_PATH` if it is not found.

## Pages

`/` · `/about` · `/community` · `/projects` (+ detail) · `/events` (+ detail) · `/team` ·
`/blog` (+ articles) · `/join` · `/privacy` · `/terms` · `sitemap.xml` · `robots.txt`

## Project structure

```
content/blog/          Blog articles (Markdown + front matter)
public/                Static files: brand assets, images, _headers
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
| Public site URL | `NEXT_PUBLIC_SITE_URL` env var on your host (see `.env.example`) | **Required** |
| Membership application form link | `applicationFormUrl` in `src/config/site.ts` | Optional. Until set, the Join page points to the community channels |
| Official email | `email` entry in `src/config/social-links.ts` | Optional |
| Team photos, bios and links | `src/data/team.ts` | Optional, hidden until set |
| BolKhata stack, repo, demo, screenshots | `src/data/projects.ts`, `src/data/achievements.ts` | Optional, hidden until set |

**Site URL behaviour.** The URL is used for canonical links, the sitemap, robots.txt and social previews.
If `NEXT_PUBLIC_SITE_URL` is not set, the build uses the URL your host provides (Vercel, Netlify,
Cloudflare Pages). On CI or a host with no usable URL, the build **fails** instead of publishing
`localhost` links. Set `ALLOW_LOCALHOST_SITE_URL=1` only for non-production checks.

## Deployment

`npm run build` writes a self-contained site to `./out`.

| Host | Setup | Security headers |
| --- | --- | --- |
| **Vercel** | Import the repo (Next.js preset). Set `NEXT_PUBLIC_SITE_URL`. | `vercel.json` |
| **Netlify** | Import the repo; `netlify.toml` sets the build command and `out` directory. Set `NEXT_PUBLIC_SITE_URL`. | `public/_headers` |
| **Cloudflare Pages** | Framework preset "Next.js (Static HTML Export)": build command `npm run build`, output `out`, env `NODE_VERSION=24` and `NEXT_PUBLIC_SITE_URL`. | `public/_headers` |
| **GitHub Pages / any static host** | Upload `out/`. Use a custom domain (the site expects to be served from the domain root). | Not supported by GitHub Pages; configure your server otherwise |

CI (`.github/workflows/ci.yml`) runs lint, type check, build, the site audit and browser tests on every
push to `main` and every pull request.

### Security headers

`public/_headers` and `vercel.json` ship the same policy: HSTS, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and a Content-Security-Policy, plus
long-lived caching for fingerprinted assets. `npm run check:site` fails if the two CSPs drift apart or a
page loads a script from another origin. The CSP allows `'unsafe-inline'` for scripts and styles because
Next.js inlines hydration data in static exports; everything else is limited to the site's own origin.
If you add third-party scripts (analytics, embeds), extend the policy in **both** files.
Verify the headers after your first deploy (for example with securityheaders.com); they have not yet
been tested on a live host.

## Known limitations

- **Images are not optimized automatically** (static export has no image server). Compress files before
  adding them to `public/`.
- **Upcoming vs previous events** is set by each event's `status`, not by today's date. Update the status
  after an event and redeploy.
- **Empty blog placeholder.** Static export needs at least one article URL, so while the blog is empty a
  `noindex` page exists at `/blog/no-posts-yet`. It is not linked or listed in the sitemap, and it
  disappears once the first article is published.
- **`scripts/fix-export-segments.mjs`** works around a Next.js 16.4 static-export bug: the client requests
  prefetch files under different names than the exporter writes them. It runs automatically after
  `next build` and does nothing once Next.js is fixed. Remove it after upgrading if `npm run test:browser`
  still passes without it.
- **Dev-only advisory.** `npm audit` reports moderate issues in `minimatch` inside the ESLint
  TypeScript tooling pinned by `eslint-config-next`. It is not part of the built site
  (`npm audit --omit=dev` reports 0). It clears when `eslint-config-next` updates.
- **Browser coverage.** Automated tests run in Chromium. In browsers without CSS scroll-driven animations
  (some Firefox/Safari versions) the scroll reveals simply appear without animating.
