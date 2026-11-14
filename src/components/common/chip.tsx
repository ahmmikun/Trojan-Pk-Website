import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"span"> & { tone?: "default" | "accent" | "success" };

/** Small label for technologies, categories and statuses. */
export function Chip({ className, tone = "default", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs leading-5",
        tone === "default" && "border-border bg-foreground/[0.03] text-muted-foreground",
        tone === "accent" && "border-foreground/15 bg-foreground/[0.06] text-foreground",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        className,
      )}
      {...props}
    />
  );
}
