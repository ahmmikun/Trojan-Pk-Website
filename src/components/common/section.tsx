import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionProps = React.ComponentProps<"section"> & {
  /** Adds a top hairline to visually separate stacked sections. */
  bordered?: boolean;
  containerSize?: "default" | "narrow" | "wide";
};

export function Section({ className, bordered = true, containerSize, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative py-20 sm:py-28", bordered && "border-t border-border", className)} {...props}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}

type HeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  children?: React.ReactNode;
};

/** Consistent section header: mono eyebrow, strong title, muted description. */
export function SectionHeading({ eyebrow, title, description, align = "left", as: Tag = "h2", className, children }: HeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow ? (
        <p className="font-mono text-xs tracking-[0.18em] text-brand-blue uppercase">
          <span aria-hidden="true" className="mr-2 text-muted-foreground">{"//"}</span>
          {eyebrow}
        </p>
      ) : null}
      <Tag className={cn("text-balance font-semibold tracking-tight", Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl")}>
        {title}
      </Tag>
      {description ? (
        <p className={cn("max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
