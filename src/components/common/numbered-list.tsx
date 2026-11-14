import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

export type NumberedItem = { title: string; description: string; icon?: LucideIcon };

const gridCols = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

/**
 * Editorial numbered list.
 * - "rows": full-width hairline rows (number, title, description).
 * - "grid": hairline grid of tall cells with the number and icon on top.
 */
export function NumberedList({
  items,
  variant = "rows",
  columns = 3,
  ordered = false,
  className,
}: {
  items: NumberedItem[];
  variant?: "rows" | "grid";
  columns?: keyof typeof gridCols;
  /** Render as <ol> when the order carries meaning (steps). */
  ordered?: boolean;
  className?: string;
}) {
  const as = ordered ? "ol" : "ul";
  const num = (i: number) => String(i + 1).padStart(2, "0");

  if (variant === "grid") {
    return (
      <Stagger as={as} className={cn("grid gap-px overflow-hidden rounded-2xl border border-border bg-border", gridCols[columns], className)}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <StaggerItem key={item.title} className="group flex min-h-72 flex-col justify-between bg-background p-8 transition-colors duration-500 hover:bg-surface">
              <div className="flex items-start justify-between">
                <span className="tabular font-mono text-xs text-muted-foreground">{num(i)}</span>
                {Icon ? <Icon aria-hidden="true" className="size-5 text-muted-foreground transition-colors duration-500 group-hover:text-foreground" /> : null}
              </div>
              <div className="mt-16">
                <h3 className="text-2xl font-medium tracking-tight">{item.title}</h3>
                <p className="mt-3 text-base leading-snug text-muted-foreground">{item.description}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    );
  }

  return (
    <Stagger as={as} className={cn("border-b border-border", className)}>
      {items.map((item, i) => (
        <StaggerItem key={item.title} className="group grid gap-3 border-t border-border py-8 sm:py-10 lg:grid-cols-12 lg:gap-8">
          <span className="tabular font-mono text-xs text-muted-foreground lg:col-span-1 lg:pt-3">{num(i)}</span>
          <h3 className="text-2xl font-medium tracking-tight transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-2 sm:text-3xl lg:col-span-5">
            {item.title}
          </h3>
          <p className="max-w-xl text-base leading-snug text-muted-foreground sm:text-lg lg:col-span-6 lg:pt-1.5">{item.description}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
