import { cn } from "@/lib/utils";

/** Presentational pieces shared by admin screens (server-safe, no client JS). */

export type StatusTone = "live" | "draft" | "muted" | "warning" | "info" | "danger" | "violet";

const PILL: Record<StatusTone, string> = {
  live: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  muted: "bg-zinc-50 text-zinc-600 ring-zinc-500/15",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/25",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};
const DOT: Record<StatusTone, string> = {
  live: "bg-emerald-500",
  draft: "bg-zinc-400",
  muted: "bg-zinc-300",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  danger: "bg-red-500",
  violet: "bg-violet-500",
};

/** Status pill: colour, dot and word, so it is readable without colour too. */
export function Status({ tone, children, className, dot = true }: { tone: StatusTone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-[550] whitespace-nowrap ring-1 ring-inset", PILL[tone], className)}>
      {dot ? <span className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function PublishStatus({ published }: { published: boolean }) {
  return published ? <Status tone="live">Live</Status> : <Status tone="draft">Draft</Status>;
}

/** Small flag such as "Sample" or "Featured". */
export function Tag({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "warning" | "info" | "violet"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[0.6875rem] font-[550] whitespace-nowrap ring-1 ring-inset",
        tone === "neutral" && "bg-zinc-50 text-zinc-700 ring-zinc-500/20",
        tone === "warning" && "bg-amber-50 text-amber-800 ring-amber-600/25",
        tone === "info" && "bg-blue-50 text-blue-700 ring-blue-600/20",
        tone === "violet" && "bg-violet-50 text-violet-700 ring-violet-600/20",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-300 bg-white px-1 font-sans text-[0.6875rem] font-medium text-zinc-500 shadow-[0_1px_0_rgb(0_0_0/0.06)]">{children}</kbd>;
}

/** Rounded square holding a section icon; colour identifies the content type. */
export const ICON_TONE = {
  blue: "bg-blue-50 text-blue-600 ring-blue-600/15",
  violet: "bg-violet-50 text-violet-600 ring-violet-600/15",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-600 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-600 ring-rose-600/15",
  sky: "bg-sky-50 text-sky-600 ring-sky-600/15",
  zinc: "bg-zinc-100 text-zinc-600 ring-zinc-500/15",
} as const;
export type IconTone = keyof typeof ICON_TONE;

export function IconTile({ children, tone = "zinc", size = "md", className }: { children: React.ReactNode; tone?: IconTone; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-lg ring-1 ring-inset",
        size === "sm" && "size-7 [&_svg]:size-3.5",
        size === "md" && "size-9 [&_svg]:size-[1.125rem]",
        size === "lg" && "size-11 rounded-xl [&_svg]:size-5",
        ICON_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({ title, description, actions, icon, meta }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; icon?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        {icon}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="text-[1.375rem] leading-tight font-[650] tracking-[-0.02em] text-zinc-950 text-balance">{title}</h1>
            {meta}
          </div>
          {description ? <p className="mt-0.5 max-w-2xl text-[0.8125rem] text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 grid size-12 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-[var(--shadow-card)] [&_svg]:size-5">{icon}</div>
      ) : null}
      <p className="text-sm font-[600] text-zinc-900">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[0.8125rem] text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** White card with a solid border and soft elevation; optional tinted header bar. */
export function Panel({
  title,
  description,
  actions,
  icon,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <section aria-labelledby={title && id ? `${id}-title` : undefined} className={cn("overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-card)]", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon}
            <div className="min-w-0">
              <h2 id={id ? `${id}-title` : undefined} className="text-[0.875rem] font-[600] text-zinc-900">{title}</h2>
              {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Pakistan time, the site's time zone. */
export function formatDate(value: unknown, opts: { time?: boolean } = {}): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric", ...(opts.time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(d);
}

export function relativeTime(value: unknown, now = Date.now()): string {
  if (!value) return "—";
  const diff = (now - new Date(String(value)).getTime()) / 1000;
  if (!Number.isFinite(diff)) return "—";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
  if (diff < 45) return "Just now";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 86400 * 14) return rtf.format(-Math.round(diff / 86400), "day");
  return formatDate(value);
}

/** Skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-zinc-200/70", className)} />;
}
