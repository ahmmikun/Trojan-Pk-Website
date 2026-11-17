# Admin v2: professional CMS plan

Status: **draft for approval**. v1 (`/admin`, built on Supabase) works end to end and stays live
while v2 is built. This plan covers the redesign, a reusable media system, code standards and
real SEO.

## 1. What is wrong with v1

| Area | Problem |
| --- | --- |
| Lists | Every cell is a pill, so nothing stands out. There are two "Status" columns (event status and published). Actions are icons only. Rows are tall because the dates wrap. Thumbnails are missing for some rows. It overflows sideways on phones. |
| Editor | The page is a stack of identical bordered cards. Raw storage paths and monospace slugs are shown. "Settings" mixes publishing with technical fields. There is no preview of how the item looks on the site. The page title scrolls away. |
| Overview | A grid of counters with no tasks: nothing says what needs attention. |
| Media | Upload code is duplicated across `ImageField`, `MiniImageInput` and the library. There is no crop or focal point, no alt-text requirement, and no usage tracking. Delete can break pages that use the image. |
| Code | One 300-line `item-form.tsx` and one generic `resources.ts`, plus copy-pasted Tailwind strings (`btn.base` …). No tests cover `/admin`. |
| SEO | Items have no per-item SEO fields. The sitemap has no real `lastmod`. Events have no `Event` JSON-LD. Social images are the same everywhere. |

## 2. Design direction

Reference quality: Linear, Vercel dashboard, Sanity Studio, Stripe. The rules:

- **Quiet chrome, loud content.** No card around every block. Group with spacing and hairline
  dividers. Use cards only for things that are physically separate (dialogs, popovers, the preview).
- **One accent.** Neutral greys plus the site's green, used only for "live" and for primary
  success. Status is a small coloured dot plus text, never a filled pill in every cell.
- **Type scale.** 13px UI text, 12px meta, 20px page titles and 28px document titles, in
  Helvetica with `tabular-nums` for all numbers and dates. Monospace only for code-like values,
  and only on focus.
- **Density.** 40px table rows, a 36px control height and an 8px spacing grid. A comfortable
  and compact toggle is saved per user.
- **Light and dark** both designed. Visible keyboard focus everywhere, and WCAG AA contrast.

## 3. Information architecture

```
/admin                     Overview: needs attention, drafts, recent activity, quick create
/admin/events              List: Upcoming / Past / Drafts tabs, search, type filter
/admin/events/new          Editor
/admin/events/[id]         Editor (Content · Media · SEO · Settings) + live preview
/admin/projects  …         same pattern
/admin/blog                Posts with word count and reading time
/admin/team                Sortable cards (drag to reorder), photo-first
/admin/partners            Sortable list with logo or wordmark preview
/admin/stats               Inline-editable table (no editor page)
/admin/testimonials        List + editor
/admin/achievements        Editor with timeline builder
/admin/media               Library: grid/list, filters, details drawer, usage
/admin/settings            Site settings, social links, SEO defaults (moves src/config to the DB)
/admin/account             Password, MFA, sessions
```

Global: a **⌘K command palette** (jump to any item, "New event", search media), breadcrumbs,
toasts, and an "unsaved changes" guard on every editor.

## 4. Screens

### Lists
- Header: title and count. Primary "New" button. Secondary: export CSV.
- Toolbar: segmented tabs (e.g. Upcoming · Past · Drafts · All), a search box (⌘F), and filter
  chips (type, featured, sample) that are shown in the URL.
- Table: the primary column is a 40px thumbnail plus the title, with a muted subtitle line
  (location · date), then 2–3 plain-text columns. Status is a dot plus a word ("Live", "Draft",
  "Scheduled"). Updated shows a relative time with the exact date on hover. Row hover shows a
  "⋯" menu (Edit, Duplicate, View on site, Publish/Unpublish, Delete).
- Bulk select: publish, unpublish, delete.
- Phones: the table becomes a stacked list (thumbnail, title, meta line, status), with no
  sideways scroll.
- Empty, loading (skeleton rows) and error states for every list.

### Editor
- Sticky header: breadcrumb, document title (editable inline), status, last saved, a
  **Preview** toggle and **Save** / **Publish** split button (Save draft, Publish, Unpublish,
  Schedule…).
- Two columns:
  - The left column holds the main fields in titled sections (Basics, Content, Media, Details).
  - The right column is a 320px inspector: Visibility (status, publish date, featured),
    URL (slug with a "lock" and the full URL preview), Ordering, and Danger zone.
- **Tabs** inside the left column: Content · SEO · Advanced (sample flag, raw ids).
- **Live preview** drawer that renders the real public card and detail header from the
  same components the site uses.
- Field components: text with counter, rich markdown editor (toolbar, paste-to-link,
  image paste → upload, side-by-side preview), date-time with a timezone note, tag input
  (chips, autocomplete from existing tags), URL with validation and favicon, select, and a
  switch. All of them are accessible: label, description, error, `aria-*`.
- Validation: the Zod schema is shared by client and server. Errors are inline and also
  listed in the error summary at the top with jump links.
- Autosave of drafts every 5s to `localStorage` with a "Restore unsaved changes?" banner.

### Overview
- **Needs attention:** events marked Upcoming whose date has passed, items missing images or
  alt text, empty SEO descriptions, sample content still live.
- Drafts in progress, recent activity (who changed what), and quick-create buttons.

## 5. Reusable media system

One component family in `src/features/admin/media/`:

| Piece | Responsibility |
| --- | --- |
| `useUpload()` | Hook: validate type/size, read dimensions, upload with **real progress** (XHR to Storage REST), insert `media_assets`, retry, cancel. The only upload code in the app. |
| `<MediaField>` | Form field: empty dropzone, then a preview with Replace / Choose / Edit / Remove. Requires alt text. Used for every single-image field. |
| `<MediaGalleryField>` | Multiple images, drag to reorder (achievements photos). |
| `<MediaPicker>` | Dialog: library grid with search and filters, upload tab, pick one or many. |
| `<MediaDetails>` | Drawer: preview, alt text, caption, credit, **focal point** picker, dimensions, size, usage list, copy URL, delete (blocked while the image is in use). |

Database changes: `media_assets` gets `caption`, `credit`, `focal_x`, `focal_y` and `blurhash`. Items
reference media by **id** (`image_id uuid references media_assets`) instead of a URL string, so
alt text and focal point follow the image everywhere and usage tracking is a simple query.
Existing `/public` paths stay supported through a migration that imports them as assets.

Images keep going through `next/image` (AVIF/WebP, long cache). The focal point becomes
`object-position`, and the blur placeholder comes from the stored blurhash.

## 6. Real SEO

Public site:
- Per-item **SEO fields**: meta title (60 characters, with a counter), meta description
  (155 characters), social image (falls back to the cover image), `noindex` switch, and a
  canonical override. A Google-style snippet preview and a social-card preview sit in the SEO tab.
- `generateMetadata` on every detail page reads these fields, with sensible fallbacks.
- **Structured data:** `Event` (startDate, endDate, location, eventStatus, image,
  organizer), `Article`/`BlogPosting`, `Organization` + `WebSite` sitewide, `Person` for the
  team, and `BreadcrumbList` on detail pages. Validated in tests.
- **Sitemap** built from the database with real `lastmod` (`updated_at`). Drafts and `noindex`
  items are excluded. Sample content is excluded from the sitemap and marked `noindex`.
- Dynamic **Open Graph images** (`opengraph-image.tsx`) per event, project and post, in the site's style.
- Clean slugs. A slug change records a **redirect** (`redirects` table read by `proxy.ts`),
  so old links keep working.
- Performance as SEO: keep LCP images `priority`, `sizes` correct, fonts local, and the
  Lighthouse budget in CI (LCP < 2.5s, CLS < 0.05, INP < 200ms).

Admin: `noindex` on every route (already done), excluded from the sitemap, disallowed in robots.

## 7. Caching and performance (keep and extend v1)

- Public reads: cookie-free client, Next data cache tagged `content:<table>` with a 1h
  revalidate, and React `cache()` dedupe per request (done).
- Saves call `updateTag` (read-your-own-writes) on the table tag **and** the item tag
  (`content:events:<slug>`), so only the affected pages rebuild.
- Admin reads stay dynamic and uncached (`private, no-store`, done).
- Indexes matching every query (done), and `select` only the columns a list needs (todo).
- Images: one-year immutable cache on the Storage objects and in the optimizer (done).

## 8. Code standards

- Feature folders: `src/features/admin/{shell,list,editor,fields,media,resources,seo}`.
- **One schema per resource** (`resources/events.ts`): a Zod schema (shared by client and server),
  field layout, list columns, and DB mapping. Generated Supabase types
  (`supabase gen types`) replace `Record<string, unknown>`.
- UI primitives in `src/components/admin-ui/` (Button, Input, Field, Select, Switch, Tabs,
  Dialog, DropdownMenu, Toast, Table, Skeleton, Tooltip), built on Base UI and styled with `cva`.
  No class strings are copied between components.
- Server Actions return a typed `Result<T>`. They never throw for user errors and always
  re-check admin status.
- Accessibility: axe checks on every admin page in `browser-test.mjs`, full keyboard
  operation, and focus management in dialogs.
- Tests: unit tests for schemas and mappers, Playwright flows for sign-in, create, edit,
  validation, publish, upload, delete and sign-out (these flows already pass manually on v1),
  and RLS tests in SQL.
- Security: MFA for admins, leaked-password protection on (Supabase advisor warning),
  rate-limited sign-in, an audit log table (`who, what, when, diff`), and a CSP that already
  allows only the Supabase origin.

## 9. Delivery order

1. **Primitives + shell**: admin-ui components, the new sidebar/header, the command palette, toasts.
2. **Media system**: `useUpload`, `MediaField`, `MediaPicker`, `MediaDetails`, the library page, and the migration to `image_id`.
3. **Events end to end**: list, editor with tabs, preview and SEO, so the pattern can be signed off.
4. Projects, Blog, Team (sortable), Partners (sortable), Achievements, Testimonials, Stats (inline).
5. **SEO**: fields, `generateMetadata`, JSON-LD, sitemap `lastmod`, OG images, redirects.
6. Overview "needs attention", settings, account (MFA), audit log.
7. Tests, axe, Lighthouse budget, docs (README/CONTENT.md), Vercel env vars.

Each step ships behind the working v1 and is verified on a production build before the next.

## 10. Decisions needed

1. Keep the dark-first look of the public site for the admin, or default the admin to light?
2. Move social links and site settings from `src/config` into the database (`/admin/settings`)?
3. Should editors (non-owners) be able to delete, or only unpublish?
4. Scheduling (publish at a future date): needed now or later?
