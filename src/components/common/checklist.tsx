import { cn } from "@/lib/utils";

/** Plain list with hairline rows and a small dot marker. */
export function Checklist({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("border-t border-border", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-4 border-b border-border py-4 text-base leading-snug text-foreground/85">
          <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-foreground/50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
