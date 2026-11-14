import { WordReveal } from "@/components/motion/motion";
import { mainNav } from "@/config/site";
import { Container } from "./container";
import { Reveal } from "./reveal";

type Props = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Editorial header shared by all inner pages: section number, eyebrow, a very
 * large headline, then description and actions split under a hairline.
 * Pulls up under the fixed navbar so its background reaches the top.
 */
export function PageHeader({ eyebrow, title, description, children }: Props) {
  const index = mainNav.findIndex((n) => n.label === eyebrow);
  return (
    <header className="bg-wash relative -mt-[var(--nav-h)] overflow-hidden border-b border-border">
      <Container className="relative pt-[calc(var(--nav-h)+5rem)] pb-14 sm:pt-[calc(var(--nav-h)+7rem)] sm:pb-20">
        <Reveal immediate>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            {index >= 0 ? <span className="tabular font-mono text-xs">({String(index + 1).padStart(2, "0")})</span> : null}
            <span aria-hidden="true" className="h-px w-8 bg-foreground/25" />
            {eyebrow}
          </p>
        </Reveal>
        <h1 className="mt-8 max-w-5xl text-balance text-5xl leading-[0.98] font-medium tracking-tighter sm:text-7xl lg:text-[6.25rem]">
          <WordReveal text={title} delay={0.05} />
        </h1>
        {description || children ? (
          <div className="mt-14 grid gap-8 border-t border-border pt-8 lg:grid-cols-12">
            {description ? (
              <Reveal immediate delay={0.4} className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
                <p className="text-lg leading-snug text-muted-foreground sm:text-xl">{description}</p>
              </Reveal>
            ) : null}
            {children ? (
              <Reveal immediate delay={0.5} className="flex flex-wrap items-start gap-3 lg:col-span-6 lg:row-start-1">
                {children}
              </Reveal>
            ) : null}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
