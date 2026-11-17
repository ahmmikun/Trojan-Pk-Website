import { FileText, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/admin-ui/button";
import { EmptyState, formatDate, IconTile, PageHeader, PublishStatus, relativeTime, Status, Tag, type StatusTone } from "@/components/admin-ui/display";
import { controlClass } from "@/components/admin-ui/field";
import { requireAdmin } from "@/features/admin/auth";
import { RowMenu } from "@/features/admin/list/row-menu";
import { MediaThumb } from "@/features/admin/media/media-thumb";
import { getResource, optionLabel, type ListColumn, type Resource, type Row } from "@/features/admin/resources";
import { NAV_ITEMS } from "@/features/admin/shell/nav";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  return { title: getResource((await params).resource)?.label ?? "Not found" };
}

const STATUS_TONE: Record<string, StatusTone> = { UPCOMING: "info", ONGOING: "live", COMPLETED: "muted", CANCELLED: "danger", IN_DEVELOPMENT: "info", MAINTAINED: "live", ARCHIVED: "muted" };
const HIDE: Record<NonNullable<ListColumn["hideBelow"]>, string> = { md: "hidden md:table-cell", lg: "hidden lg:table-cell", xl: "hidden xl:table-cell" };

function Cell({ resource, column, row }: { resource: Resource; column: ListColumn; row: Row }) {
  const v = row[column.name];
  if (v === null || v === undefined || v === "") return <span className="text-zinc-300">—</span>;
  switch (column.kind) {
    case "date":
      return <span className="text-zinc-700 tabular-nums">{formatDate(v)}</span>;
    case "number":
      return <span className="font-[550] text-zinc-800 tabular-nums">{String(v)}</span>;
    case "option":
      return column.name === "status" ? <Status tone={STATUS_TONE[String(v)] ?? "muted"}>{optionLabel(resource, column.name, v)}</Status> : <span className="text-zinc-700">{optionLabel(resource, column.name, v)}</span>;
    default:
      return <span className="line-clamp-1 text-zinc-700">{String(v)}</span>;
  }
}

export default async function ResourceList({ params, searchParams }: PageProps<"/admin/[resource]">) {
  const resource = getResource((await params).resource);
  if (!resource) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const tabs = [{ id: "all", label: "All" }, ...(resource.tabs ?? []), { id: "drafts", label: "Drafts" }];
  const tab = tabs.find((t) => t.id === sp.tab) ?? tabs[0];
  const nav = NAV_ITEMS.find((n) => n.resource === resource.key);

  const { supabase } = await requireAdmin();
  let query = supabase.from(resource.table).select("*", { count: "exact" }).limit(500);
  query = resource.ordered ? query.order("sort_order").order("created_at", { ascending: false }) : query.order("updated_at", { ascending: false });
  if (tab.id === "drafts") query = query.eq("published", false);
  for (const f of resource.tabs?.find((t) => t.id === tab.id)?.filter ?? []) query = f.op === "in" ? query.in(f.column, f.value as string[]) : query.eq(f.column, f.value as string);
  // Escape LIKE wildcards so a search for "100%" matches literally.
  if (q) query = query.ilike(resource.titleField, `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  const { data, error, count } = await query;
  const rows = (data ?? []) as Row[];

  const idOf = (row: Row) => encodeURIComponent(String(row[resource.idColumn]));
  const hrefFor = (t: string) => {
    const p = new URLSearchParams();
    if (t !== "all") p.set("tab", t);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/${resource.key}${s ? `?${s}` : ""}`;
  };
  const newHref = `/admin/${resource.key}/new`;
  const filtered = Boolean(q) || tab.id !== "all";
  const total = count ?? rows.length;
  const firstColumn = resource.titleField === "name" ? "Name" : resource.singular;

  return (
    <>
      <PageHeader
        icon={nav ? <IconTile tone={nav.tone} size="lg"><nav.icon /></IconTile> : undefined}
        title={resource.label}
        meta={<span className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-[600] text-zinc-700 tabular-nums">{total}</span>}
        description={resource.description}
        actions={
          <ButtonLink href={newHref} variant="primary">
            <Plus aria-hidden="true" />
            New {resource.singular.toLowerCase()}
          </ButtonLink>
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Filter" className="-mx-1 overflow-x-auto px-1">
            <div className="inline-flex gap-0.5 rounded-lg bg-zinc-200/60 p-0.5">
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={hrefFor(t.id)}
                  aria-current={tab.id === t.id ? "page" : undefined}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center rounded-md px-3 text-[0.8125rem] transition-all",
                    tab.id === t.id ? "bg-white font-[600] text-zinc-950 shadow-[0_1px_2px_rgb(16_24_40/0.08)] ring-1 ring-zinc-900/5" : "font-[500] text-zinc-600 hover:text-zinc-950",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </nav>
          <form role="search" className="relative sm:w-72">
            {tab.id !== "all" ? <input type="hidden" name="tab" value={tab.id} /> : null}
            <label htmlFor="q" className="sr-only">Search {resource.label.toLowerCase()}</label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input id="q" name="q" type="search" defaultValue={q} placeholder={`Search ${resource.label.toLowerCase()}…`} className={cn(controlClass, "h-9 pl-9")} />
          </form>
        </div>

        {error ? (
          <p role="alert" className="px-4 py-10 text-center text-[0.8125rem] text-red-700">Could not load {resource.label.toLowerCase()}: {error.message}</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={nav ? <nav.icon /> : <FileText />}
            title={filtered ? "No matches" : `No ${resource.label.toLowerCase()} yet`}
            description={filtered ? "Try another filter or search term." : `Create the first ${resource.singular.toLowerCase()}. New entries start as drafts.`}
            action={filtered ? <ButtonLink href={hrefFor("all")}>Clear filters</ButtonLink> : <ButtonLink href={newHref} variant="primary"><Plus aria-hidden="true" />New {resource.singular.toLowerCase()}</ButtonLink>}
          />
        ) : (
          <>
            {/* Tablet and desktop */}
            <table className="hidden w-full table-fixed text-[0.8125rem] sm:table">
              <thead className="border-b border-zinc-200 text-left">
                <tr className="text-[0.6875rem] font-[600] tracking-[0.05em] text-zinc-500 uppercase">
                  <th scope="col" className="px-5 py-2.5">{firstColumn}</th>
                  {resource.columns.map((c) => (
                    <th key={c.name} scope="col" className={cn("w-36 px-4 py-2.5", c.hideBelow && HIDE[c.hideBelow], c.align === "right" && "w-24 text-right")}>{c.label}</th>
                  ))}
                  <th scope="col" className="w-28 px-4 py-2.5">Visibility</th>
                  <th scope="col" className="hidden w-32 px-4 py-2.5 md:table-cell">Updated</th>
                  <th scope="col" className="w-14 px-3 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((row) => {
                  const href = `/admin/${resource.key}/${idOf(row)}`;
                  const title = String(row[resource.titleField] ?? "Untitled");
                  const subtitle = resource.subtitle?.(row);
                  return (
                    <tr key={idOf(row)} className="group relative transition-colors hover:bg-zinc-50">
                      <td className="px-5 py-3">
                        <div className="flex min-w-0 items-center gap-3.5">
                          {resource.imageField ? <MediaThumb src={row[resource.imageField] as string | null} className="size-10 shrink-0 rounded-lg ring-1 ring-zinc-900/10" /> : null}
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <Link href={href} className="truncate font-[600] text-zinc-900 outline-none after:absolute after:inset-0 group-hover:text-zinc-950 focus-visible:underline">{title}</Link>
                              {row.is_sample ? <Tag tone="warning">Sample</Tag> : null}
                              {row.is_featured || row.featured ? <Tag tone="violet">Featured</Tag> : null}
                            </div>
                            {subtitle ? <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p> : null}
                          </div>
                        </div>
                      </td>
                      {resource.columns.map((c) => (
                        <td key={c.name} className={cn("truncate px-4 py-3", c.hideBelow && HIDE[c.hideBelow], c.align === "right" && "text-right")}>
                          <Cell resource={resource} column={c} row={row} />
                        </td>
                      ))}
                      <td className="px-4 py-3"><PublishStatus published={Boolean(row.published)} /></td>
                      <td className="hidden px-4 py-3 text-zinc-500 tabular-nums md:table-cell" title={formatDate(row.updated_at, { time: true })}>{relativeTime(row.updated_at)}</td>
                      <td className="relative z-10 px-3 py-3 text-right">
                        <RowMenu resourceKey={resource.key} id={String(row[resource.idColumn])} title={title} editHref={href} publicHref={row.published ? resource.publicPath?.(row) : null} published={Boolean(row.published)} canDuplicate={resource.idKind === "uuid"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Phones: stacked rows, no sideways scrolling */}
            <ul className="divide-y divide-zinc-100 sm:hidden">
              {rows.map((row) => {
                const href = `/admin/${resource.key}/${idOf(row)}`;
                const title = String(row[resource.titleField] ?? "Untitled");
                const subtitle = resource.subtitle?.(row);
                return (
                  <li key={idOf(row)} className="relative flex items-center gap-3 px-4 py-3.5 active:bg-zinc-50">
                    {resource.imageField ? <MediaThumb src={row[resource.imageField] as string | null} className="size-11 shrink-0 rounded-lg ring-1 ring-zinc-900/10" /> : null}
                    <div className="min-w-0 flex-1">
                      <Link href={href} className="block truncate text-[0.8125rem] font-[600] text-zinc-900 after:absolute after:inset-0">{title}</Link>
                      {subtitle ? <p className="truncate text-xs text-zinc-500">{subtitle}</p> : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <PublishStatus published={Boolean(row.published)} />
                        {row.is_sample ? <Tag tone="warning">Sample</Tag> : null}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <RowMenu resourceKey={resource.key} id={String(row[resource.idColumn])} title={title} editHref={href} publicHref={row.published ? resource.publicPath?.(row) : null} published={Boolean(row.published)} canDuplicate={resource.idKind === "uuid"} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/70 px-5 py-2.5 text-xs text-zinc-500 tabular-nums">
              <span>
                Showing <span className="font-[600] text-zinc-800">{rows.length}</span> of <span className="font-[600] text-zinc-800">{total}</span>
              </span>
              <span>{resource.ordered ? "Sorted by display order" : "Most recently edited first"}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
