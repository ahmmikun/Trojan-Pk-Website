import { AlertTriangle, ArrowRight, CalendarClock, ImageOff, Plus, UploadCloud } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin-ui/button";
import { PageHeader, PublishStatus, relativeTime } from "@/components/admin-ui/display";
import { requireAdmin } from "@/features/admin/auth";
import { RESOURCE_LIST, RESOURCES, type Resource } from "@/features/admin/resources";

export const metadata: Metadata = { title: "Overview" };

type Task = { id: string; icon: React.ReactNode; title: string; detail: string; href: string };

export default async function AdminOverview() {
  const { supabase, user } = await requireAdmin();
  const now = new Date();
  const nowIso = now.toISOString();

  const summaries = await Promise.all(
    RESOURCE_LIST.map(async (r) => {
      const [all, live, recent] = await Promise.all([
        supabase.from(r.table).select(r.idColumn, { count: "exact", head: true }),
        supabase.from(r.table).select(r.idColumn, { count: "exact", head: true }).eq("published", true),
        supabase.from(r.table).select(`${r.idColumn}, ${r.titleField}, published, updated_at`).order("updated_at", { ascending: false }).limit(6),
      ]);
      return { resource: r, total: all.count ?? 0, published: live.count ?? 0, recent: ((recent.data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({ resource: r, row })) };
    }),
  );

  const [stale, sampleLive, noCover, noAlt] = await Promise.all([
    supabase.from("events").select("id, title").in("status", ["UPCOMING", "ONGOING"]).lt("starts_at", nowIso).limit(10),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("is_sample", true).eq("published", true),
    supabase.from("events").select("id, title").eq("published", true).is("image", null).eq("is_sample", false).limit(10),
    supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("alt", ""),
  ]);

  const tasks: Task[] = [
    ...(stale.data ?? []).map((e) => ({ id: `stale-${e.id}`, icon: <CalendarClock />, title: e.title, detail: "Date has passed but it is still marked upcoming. Set it to Completed.", href: `/admin/events/${e.id}` })),
    ...(noCover.data ?? []).map((e) => ({ id: `cover-${e.id}`, icon: <ImageOff />, title: e.title, detail: "Published without a cover image.", href: `/admin/events/${e.id}` })),
    ...(sampleLive.count ? [{ id: "samples", icon: <AlertTriangle />, title: `${sampleLive.count} sample events are live`, detail: "Placeholder events are public. Unpublish them once real events exist.", href: "/admin/events" }] : []),
    ...(noAlt.count ? [{ id: "alt", icon: <ImageOff />, title: `${noAlt.count} images without alt text`, detail: "Alt text helps screen readers and image search.", href: "/admin/media" }] : []),
  ];

  const activity = summaries
    .flatMap((s) => s.recent)
    .sort((a, b) => String(b.row.updated_at).localeCompare(String(a.row.updated_at)))
    .slice(0, 8);

  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Karachi" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = user.email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase());
  const primary: Resource[] = [RESOURCES.events, RESOURCES.projects, RESOURCES.blog, RESOURCES.team];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${name}`}
        description="Changes you save here are live on the public site within seconds."
        actions={
          <>
            <ButtonLink href="/admin/media">
              <UploadCloud aria-hidden="true" />
              Upload media
            </ButtonLink>
            <ButtonLink href="/admin/events/new" variant="primary">
              <Plus aria-hidden="true" />
              New event
            </ButtonLink>
          </>
        }
      />

      <section aria-label="Content summary" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-xs lg:grid-cols-4">
        {primary.map((r) => {
          const s = summaries.find((x) => x.resource.key === r.key)!;
          const drafts = s.total - s.published;
          return (
            <Link key={r.key} href={`/admin/${r.key}`} className="group flex flex-col gap-3 bg-card p-4 transition-colors hover:bg-muted/40">
              <span className="flex items-center justify-between text-[0.8125rem] text-muted-foreground">
                {r.label}
                <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
              </span>
              <span className="text-2xl font-medium tracking-tight tabular-nums">{s.published}</span>
              <span className="text-xs text-muted-foreground tabular-nums">live{drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}</span>
            </Link>
          );
        })}
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="attention" className="rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id="attention" className="text-[0.8125rem] font-medium">Needs attention</h2>
              <span className="text-xs text-muted-foreground tabular-nums">{tasks.length}</span>
            </div>
            {tasks.length ? (
              <ul className="divide-y divide-border">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <Link href={t.href} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
                      <span className="mt-0.5 text-amber-600 [&_svg]:size-4" aria-hidden="true">{t.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium">{t.title}</span>
                        <span className="block text-xs text-muted-foreground">{t.detail}</span>
                      </span>
                      <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-[0.8125rem] text-muted-foreground">Everything looks good.</p>
            )}
          </section>

          <section aria-labelledby="recent" className="rounded-xl border border-border bg-card shadow-xs">
            <h2 id="recent" className="border-b border-border px-4 py-3 text-[0.8125rem] font-medium">Recently edited</h2>
            <ul className="divide-y divide-border">
              {activity.map(({ resource, row }) => (
                <li key={`${resource.key}-${String(row[resource.idColumn])}`}>
                  <Link href={`/admin/${resource.key}/${encodeURIComponent(String(row[resource.idColumn]))}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-4 py-2.5 transition-colors hover:bg-muted/40 sm:grid-cols-[7rem_1fr_auto_5.5rem]">
                    <span className="hidden text-xs text-muted-foreground sm:block">{resource.singular}</span>
                    <span className="truncate text-[0.8125rem]">{String(row[resource.titleField] ?? "Untitled")}</span>
                    <PublishStatus published={Boolean(row.published)} />
                    <span className="hidden text-right text-xs text-muted-foreground tabular-nums sm:block">{relativeTime(row.updated_at, now.getTime())}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="all-content" className="h-fit rounded-xl border border-border bg-card shadow-xs">
          <h2 id="all-content" className="border-b border-border px-4 py-3 text-[0.8125rem] font-medium">All content</h2>
          <ul className="p-1.5">
            {summaries.map(({ resource, total, published }) => (
              <li key={resource.key}>
                <Link href={`/admin/${resource.key}`} className="flex h-8 items-center justify-between rounded-md px-2.5 text-[0.8125rem] transition-colors hover:bg-foreground/[0.04]">
                  <span>{resource.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{published}/{total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
