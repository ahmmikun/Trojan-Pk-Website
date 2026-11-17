import { cn } from "@/lib/utils";

/** Small presentational pieces shared by admin screens (server-safe, no client JS). */

export type StatusTone = "live" | "draft" | "muted" | "warning" | "info";

const DOT: Record<StatusTone, string> = {
  live: "bg-success",
  draft: "bg-foreground/25",
  muted: "bg-foreground/15",
  warning: "bg-amber-500",
  info: "bg-[#2f6feb]",
};

/** Status as a coloured dot plus a word: readable in a dense table and not colour-only. */
export function Status({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[0.8125rem] whitespace-nowrap", tone === "draft" || tone === "muted" ? "text-muted-foreground" : "text-foreground", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

export function PublishStatus({ published }: { published: boolean }) {
  return published ? <Status tone="live">Live</Status> : <Status tone="draft">Draft</Status>;
}

/** Quiet label for flags such as "Sample" or "Featured". */
export function Tag({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "warning" | "info"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded px-1.5 text-[0.6875rem] font-medium whitespace-nowrap",
        tone === "neutral" && "bg-foreground/[0.06] text-foreground/75",
        tone === "warning" && "bg-amber-500/12 text-amber-700",
        tone === "info" && "bg-[#2f6feb]/10 text-[#1d4fbf]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1 font-sans text-[0.6875rem] text-muted-foreground shadow-[0_1px_0_var(--border)]">{children}</kbd>;
}

export function PageHeader({ title, description, actions, breadcrumb, meta }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; breadcrumb?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-1.5">{breadcrumb}</div> : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-xl font-medium tracking-[-0.015em] text-balance">{title}</h1>
          {meta}
        </div>
        {description ? <p className="mt-1 max-w-2xl text-[0.8125rem] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 grid size-10 place-items-center rounded-lg border border-border bg-background text-muted-foreground shadow-xs [&_svg]:size-5">{icon}</div> : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[0.8125rem] text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }: { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-xs", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[0.8125rem] font-medium">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
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
