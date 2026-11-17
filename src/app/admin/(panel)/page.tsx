import { AlertTriangle, ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, ImageOff, Plus, UploadCloud } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin-ui/button";
import { IconTile, Panel, PublishStatus, relativeTime } from "@/components/admin-ui/display";
import { requireAdmin } from "@/features/admin/auth";
import { RESOURCES } from "@/features/admin/resources";
import { NAV_ITEMS } from "@/features/admin/shell/nav";

export const metadata: Metadata = { title: "Overview" };

type Overview = {
  counts: Record<string, { total: number; published: number }>;
  recent: { resource: string; id: string; title: string; published: boolean; updated_at: string }[];
  stale_events: { id: string; title: string }[];
  no_cover: { id: string; title: string }[];
  sample_live: number;
  no_alt: number;
  media: number;
};

type Task = { id: string; icon: React.ReactNode; tone: "amber" | "rose"; title: string; detail: string; href: string; cta: string };

export default async function AdminOverview() {
  const { supabase, user } = await requireAdmin();
  // One database round trip for the whole dashboard (public.admin_overview, security invoker).
  const { data, error } = await supabase.rpc("admin_overview");
  const o = (data ?? { counts: {}, recent: [], stale_events: [], no_cover: [], sample_live: 0, no_alt: 0, media: 0 }) as Overview;

  const tasks: Task[] = [
    ...o.stale_events.map((e) => ({ id: `stale-${e.id}`, icon: <CalendarClock />, tone: "amber" as const, title: e.title, detail: "The date has passed but it is still listed as upcoming.", href: `/admin/events/${e.id}`, cta: "Mark completed" })),
    ...o.no_cover.map((e) => ({ id: `cover-${e.id}`, icon: <ImageOff />, tone: "rose" as const, title: e.title, detail: "Published without a cover image.", href: `/admin/events/${e.id}`, cta: "Add image" })),
    ...(o.sample_live ? [{ id: "samples", icon: <AlertTriangle />, tone: "amber" as const, title: `${o.sample_live} sample events are live`, detail: "Placeholder events are public. Unpublish them once real events exist.", href: "/admin/events", cta: "Review" }] : []),
    ...(o.no_alt ? [{ id: "alt", icon: <ImageOff />, tone: "amber" as const, title: `${o.no_alt} images without alt text`, detail: "Alt text helps screen readers and image search.", href: "/admin/media", cta: "Fix" }] : []),
  ];

  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Karachi" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = user.email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase());
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Karachi" }).format(now);
  const stats = ["events", "projects", "blog", "team"].map((k) => ({ r: RESOURCES[k], nav: NAV_ITEMS.find((n) => n.resource === k)!, c: o.counts[k] ?? { total: 0, published: 0 } }));
  const quick = ["events", "projects", "blog", "team", "partners"].map((k) => ({ r: RESOURCES[k], nav: NAV_ITEMS.find((n) => n.resource === k)! }));

  return (
    <>
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-6 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,black,transparent_75%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-[500] text-zinc-400">{today}</p>
            <h1 className="mt-1.5 text-2xl font-[650] tracking-[-0.02em]">{greeting}, {name}</h1>
            <p className="mt-1 max-w-lg text-[0.8125rem] text-zinc-400">Everything on the public site is managed here. Saved changes go live within seconds.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/media" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3.5 text-[0.8125rem] font-[550] text-white ring-1 ring-white/15 ring-inset transition-colors hover:bg-white/15">
              <UploadCloud className="size-4" aria-hidden="true" />
              Upload media
            </Link>
            <Link href="/admin/events/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[0.8125rem] font-[600] text-zinc-950 shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-colors hover:bg-zinc-100">
              <Plus className="size-4" aria-hidden="true" />
              New event
            </Link>
          </div>
        </div>
      </section>

      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.8125rem] text-red-700">Could not load the dashboard: {error.message}</p> : null}

      {/* Stat cards */}
      <section aria-label="Content summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ r, nav, c }) => {
          const drafts = c.total - c.published;
          return (
            <Link key={r.key} href={`/admin/${r.key}`} className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[var(--shadow-pop)]">
              <div className="flex items-start justify-between">
                <IconTile tone={nav.tone}><nav.icon /></IconTile>
                <ArrowUpRight className="size-4 text-zinc-300 transition-colors group-hover:text-zinc-600" aria-hidden="true" />
              </div>
              <p className="mt-4 text-[0.8125rem] font-[500] text-zinc-500">{r.label}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-[650] tracking-[-0.03em] text-zinc-950 tabular-nums">{c.published}</span>
                <span className="text-xs font-[500] text-zinc-500">live</span>
              </p>
              <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 tabular-nums">
                {c.total} total{drafts ? <> · <span className="font-[550] text-amber-700">{drafts} draft{drafts === 1 ? "" : "s"}</span></> : null}
              </p>
            </Link>
          );
        })}
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="attention"
            title="Needs attention"
            description="Things worth fixing before visitors notice."
            actions={<span className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-[600] text-zinc-700 tabular-nums">{tasks.length}</span>}
            bodyClassName="p-0"
          >
            {tasks.length ? (
              <ul className="divide-y divide-zinc-100">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <Link href={t.href} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50">
                      <IconTile tone={t.tone} size="sm">{t.icon}</IconTile>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-[600] text-zinc-900">{t.title}</span>
                        <span className="block text-xs text-zinc-500">{t.detail}</span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 text-xs font-[550] text-zinc-600 group-hover:text-zinc-950 sm:inline-flex">
                        {t.cta}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center justify-center gap-2 px-5 py-10 text-[0.8125rem] text-zinc-500">
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                Everything looks good.
              </p>
            )}
          </Panel>

          <Panel id="recent" title="Recent activity" description="Latest edits across all content." bodyClassName="p-0">
            {o.recent.length ? (
              <ul className="divide-y divide-zinc-100">
                {o.recent.map((item) => {
                  const r = RESOURCES[item.resource];
                  const nav = NAV_ITEMS.find((n) => n.resource === item.resource);
                  if (!r) return null;
                  return (
                    <li key={`${item.resource}-${item.id}`}>
                      <Link href={`/admin/${r.key}/${encodeURIComponent(item.id)}`} className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-zinc-50">
                        {nav ? <IconTile tone={nav.tone} size="sm"><nav.icon /></IconTile> : null}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-[550] text-zinc-900">{item.title || "Untitled"}</span>
                          <span className="block text-xs text-zinc-500">{r.singular} · edited {relativeTime(item.updated_at, now.getTime()).toLowerCase()}</span>
                        </span>
                        <PublishStatus published={item.published} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-[0.8125rem] text-zinc-500">No edits yet.</p>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="create" title="Quick create" bodyClassName="p-2">
            <ul className="flex flex-col gap-0.5">
              {quick.map(({ r, nav }) => (
                <li key={r.key}>
                  <Link href={`/admin/${r.key}/new`} className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] font-[550] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950">
                    <IconTile tone={nav.tone} size="sm"><nav.icon /></IconTile>
                    <span className="flex-1">New {r.singular.toLowerCase()}</span>
                    <Plus className="size-4 text-zinc-300 group-hover:text-zinc-600" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel id="all" title="All content" bodyClassName="p-0">
            <ul className="divide-y divide-zinc-100">
              {Object.values(RESOURCES).map((r) => {
                const c = o.counts[r.key] ?? { total: 0, published: 0 };
                const pct = c.total ? Math.round((c.published / c.total) * 100) : 0;
                return (
                  <li key={r.key}>
                    <Link href={`/admin/${r.key}`} className="flex items-center gap-3 px-5 py-2.5 text-[0.8125rem] transition-colors hover:bg-zinc-50">
                      <span className="flex-1 font-[500] text-zinc-800">{r.label}</span>
                      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 sm:block" aria-hidden="true">
                        <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-12 text-right text-xs text-zinc-500 tabular-nums">{c.published}/{c.total}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-zinc-200 bg-zinc-50/70 px-5 py-2.5 text-xs text-zinc-500">
              <Link href="/admin/media" className="font-[550] text-zinc-700 hover:text-zinc-950">{o.media} images</Link> in the media library
            </p>
          </Panel>
          <ButtonLink href="/" target="_blank" rel="noopener noreferrer" className="w-full">
            Open the public website
            <ArrowUpRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
