# Dynamic content plan: Supabase + `/admin`

Goal: edit every piece of site content from a private `/admin` dashboard, store images in
Supabase Storage, and keep the public site fast (prerendered + ISR), with nothing breaking if
the database is unreachable.

## Architecture

```
Admin (browser) ──Server Actions──▶ Supabase (Postgres + RLS, Storage "media")
                         │
                         └─ revalidateTag("events") etc. ──▶ public pages rebuild on next visit

Visitor ──▶ prerendered page (ISR) ──▶ src/content/* loaders ──▶ Supabase (cookie-free, cached)
                                                       └── falls back to src/data/* if unset
```

- **Public reads** use a cookie-free Supabase client inside the existing loaders in
  `src/content/`. Pages stay static. Components do not change, because the loaders keep returning
  the same TypeScript types.
- **Writes** only happen in Server Actions under `/admin`, using the signed-in admin's session.
  The database enforces permissions with RLS, so a bug in the UI cannot widen access.
- **Freshness:** each save calls `revalidateTag(<table>)`, so changes show up within seconds
  instead of waiting for the hourly ISR.
- **Fallback:** if the Supabase env vars are missing, the loaders read `src/data/*`. CI and local
  builds keep working without the database.

## Database (done: migration `init_content_schema`, applied via Supabase MCP)

| Table | Mirrors | Notes |
| --- | --- | --- |
| `admins` | — | Allowlist of `auth.users` who may edit. Role `owner` or `editor`. |
| `projects` | `Project` | Markdown `content`, `technologies text[]`, `contributors jsonb`. |
| `events` | `CommunityEvent` | `is_sample` flag keeps sample events labelled. |
| `team_members` | `TeamMember` | `sort_order` controls the order on the Team page. |
| `partners` | `Partner` | Collaborations section. |
| `testimonials` | `Testimonial` | |
| `achievements` | `Achievement` | `timeline`, `images`, `links` as `jsonb`. |
| `stats` | `CommunityStat` | `value` null hides the stat. |
| `blog_posts` | `BlogPost` | Replaces `content/blog/*.md` once migrated. |
| `media_assets` | — | Media library: storage path, alt text, size, dimensions. |

Every content table has `published`, `sort_order`, `created_at`, and an `updated_at` that a trigger
keeps current. Slugs, URLs (https only), enums and years are checked by constraints, so bad data is
rejected by the database as well as by the forms.

**RLS:** anyone can read rows where `published = true`. Admins can read everything and
insert, update or delete. `private.is_admin()` is a `security definer` function in a schema that
the API does not expose.

**Storage:** public bucket `media`, 10 MB limit, JPEG/PNG/WebP/AVIF only. SVG is excluded
because it can carry scripts. Only admins can upload, replace or delete. Images go through the
Next.js optimizer, so `next.config.ts` gets the Supabase host in `images.remotePatterns`.

## `/admin` UI

A desktop-first dashboard in the site's design system, kept separate from the public layout
(no curtain, no Lenis, `noindex`).

- **Sign in:** `/admin/login` uses Supabase Auth with email + password. There is no public sign-up.
  An account only has access once its user id is in `admins`.
- **Guard:** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) refreshes the session
  cookie for `/admin/*`. The admin layout also checks `getUser()` plus membership in `admins` on
  the server, so the proxy is never the only check.
- **Layout:** sidebar (Overview, Events, Projects, Team, Partners, Achievements, Testimonials,
  Stats, Blog, Media), with a top bar showing the account and a "View site" link.
- **List views:** a table with search, a status filter (Published / Draft), sort, and row actions
  (Edit, Duplicate, Publish/Unpublish, Delete with confirmation).
- **Editor:** a two-column form with fields on the left and a live preview card plus
  publish settings on the right. It uses Zod validation that reuses `src/content/schemas.ts`, shows
  inline errors, warns about unsaved changes, and offers a markdown editor with preview for long text.
- **Media:** drag-and-drop upload with a progress bar and a required alt text field, a grid library
  with search, a "copy URL" action, and a picker modal used by every image field.
- **Ordering:** drag to reorder team members, partners and stats (writes `sort_order`).

## Phases

1. **Schema + storage**: done.
2. **Seed:** done for content (7 events incl. 6 flagged `is_sample`, 3 team members,
   1 project, 2 partners, 1 achievement, 4 stats). Image columns still hold local `/public`
   paths, which keep working. Uploading them into `media` waits for the first admin account,
   because Storage only accepts uploads from admins.
3. **Read path:** switch the `src/content/*` loaders to Supabase with the file fallback. Add
   `images.remotePatterns` and extend the CSP `connect-src`/`img-src`. Update the tests.
4. **Auth + admin shell:** login, `proxy.ts`, the guarded layout, sidebar and Overview.
5. **Editors:** Events first (it has the most fields and shows the patterns), then Team, Partners,
   Projects, Achievements, Testimonials, Stats.
6. **Media library and picker.**
7. **Blog** in the database (migrate the Markdown files), then retire `src/data/*` as the source of truth.
8. **Hardening:** Supabase advisors, MFA for admins, rate limits on login, an audit trail
   (`updated_by`), browser tests for `/admin`, and Vercel env vars.

## Open decisions

- Admin accounts: which email(s) become the first `owner`.
- Whether editors should be able to delete, or only unpublish.
- Blog editing in the browser vs keeping Markdown in Git for long articles.
