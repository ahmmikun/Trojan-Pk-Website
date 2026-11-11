import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"span"> & { tone?: "default" | "accent" | "success" };

/** Small mono label for technologies, categories and statuses. */
export function Chip({ className, tone = "default", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] leading-5 tracking-wide",
        tone === "default" && "border-border bg-white/[0.03] text-muted-foreground",
        tone === "accent" && "border-brand-blue/40 bg-brand-blue/10 text-[#8fb0ff]",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        className,
      )}
      {...props}
    />
  );
}
