import { cn } from "@/lib/utils";

type Props = { title: string; description?: string; children?: React.ReactNode; className?: string };

export function EmptyState({ title, description, children, className }: Props) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border px-6 py-20 text-center", className)}>
      <p className="text-2xl font-medium tracking-tight">{title}</p>
      {description ? <p className="mx-auto mt-3 max-w-md text-base leading-snug text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-8 flex justify-center gap-3">{children}</div> : null}
    </div>
  );
}
