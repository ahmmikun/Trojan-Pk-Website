import { cn } from "@/lib/utils";

type Props = { title: string; description?: string; children?: React.ReactNode; className?: string };

export function EmptyState({ title, description, children, className }: Props) {
  return (
    <div className={cn("rounded-lg border border-dashed border-border bg-surface/50 px-6 py-14 text-center", className)}>
      <p className="text-base font-medium">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-6 flex justify-center gap-3">{children}</div> : null}
    </div>
  );
}
