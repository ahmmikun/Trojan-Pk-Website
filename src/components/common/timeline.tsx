import { formatDate } from "@/lib/format";

export type TimelineItem = { label: string; title: string; detail: string; date: Date | null };

/** Editorial timeline: label and date on the left, story on the right, hairline rows. */
export function Timeline({ items, ariaLabel }: { items: TimelineItem[]; ariaLabel: string }) {
  return (
    <ol aria-label={ariaLabel} className="border-b border-border">
      {items.map((step) => {
        const date = formatDate(step.date);
        return (
          <li key={step.title} className="grid gap-2 border-t border-border py-8 sm:grid-cols-[11rem_1fr] sm:gap-8">
            <div className="text-sm text-muted-foreground">
              <p>{step.label}</p>
              {date && step.date ? <time dateTime={step.date.toISOString().slice(0, 10)} className="tabular mt-1 block">{date}</time> : null}
            </div>
            <div>
              <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{step.title}</h3>
              <p className="mt-2 max-w-xl text-base leading-snug text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
