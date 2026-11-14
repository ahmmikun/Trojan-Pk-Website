import { formatDate } from "@/lib/format";

export type TimelineItem = { label: string; title: string; detail: string; date: Date | null };

export function Timeline({ items, ariaLabel }: { items: TimelineItem[]; ariaLabel: string }) {
  return (
    <ol aria-label={ariaLabel} className="relative">
      {items.map((step, i) => {
        const date = formatDate(step.date);
        return (
          <li key={step.title} className="relative pb-10 pl-9 last:pb-0">
            {i < items.length - 1 ? <span aria-hidden="true" className="absolute top-3 bottom-0 left-[5px] w-px bg-border" /> : null}
            <span aria-hidden="true" className="absolute top-1.5 left-0 size-[11px] rounded-full border border-brand-blue bg-background" />
            <p className="text-xs text-brand-blue">{step.label}</p>
            <h3 className="mt-1 text-lg font-medium tracking-tight">{step.title}</h3>
            {date && step.date ? (
              <time dateTime={step.date.toISOString().slice(0, 10)} className="mt-1 block text-sm text-muted-foreground">{date}</time>
            ) : null}
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
