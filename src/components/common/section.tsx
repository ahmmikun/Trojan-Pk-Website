import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionProps = React.ComponentProps<"section"> & {
  /** Adds a top hairline to visually separate stacked sections. */
  bordered?: boolean;
  containerSize?: "default" | "narrow" | "wide";
};

export function Section({ className, bordered = true, containerSize, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative py-24 sm:py-32", bordered && "border-t border-border", className)} {...props}>
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

/** Consistent section header: small label, large tight title, muted description. */
export function SectionHeading({ eyebrow, title, description, align = "left", as: Tag = "h2", className, children }: HeadingProps) {
  return (
    <Reveal immediate={Tag === "h1"} className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      {eyebrow ? (
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-foreground/60" />
          {eyebrow}
        </p>
      ) : null}
      <Tag className={cn("text-balance font-medium", Tag === "h1" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl")}>
        {title}
      </Tag>
      {description ? (
        <p className={cn("max-w-2xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
      {children}
    </Reveal>
  );
}
