import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WordReveal } from "@/components/motion/motion";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Cover } from "./cover";
import { Reveal } from "./reveal";

type Props = {
  back: { href: string; label: string };
  /** Small line above the title, e.g. category and status. */
  meta: React.ReactNode;
  title: string;
  summary: string;
  /** Buttons next to the summary. */
  actions?: React.ReactNode;
  /** Extra content under the summary, e.g. author and date. */
  children?: React.ReactNode;
  /** Omit to render no cover. A null src renders the typographic cover. */
  cover?: { src: string | null; title: string; label?: string };
  /** Narrow reading column (articles). */
  narrow?: boolean;
};

/** Editorial header for project, event and article pages, followed by a full-width cover. */
export function DetailHeader({ back, meta, title, summary, actions, children, cover, narrow = false }: Props) {
  return (
    <>
      <header className="bg-wash relative -mt-[var(--nav-h)] overflow-hidden border-b border-border">
        <Container size={narrow ? "narrow" : "default"} className="relative pt-[calc(var(--nav-h)+2.5rem)] pb-12 sm:pb-16">
          <Reveal immediate>
            <Link href={back.href} className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:-translate-x-1" />
              <span className="link-underline">{back.label}</span>
            </Link>
          </Reveal>
          <Reveal immediate delay={0.05}>
            <div className="mt-16 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{meta}</div>
          </Reveal>
          <h1 className={cn("mt-6 max-w-5xl text-balance leading-[1] font-medium tracking-tighter", narrow ? "text-4xl sm:text-6xl" : "text-4xl sm:text-6xl lg:text-7xl")}>
            <WordReveal text={title} delay={0.1} />
          </h1>
          <div className={cn("mt-12 grid gap-8 border-t border-border pt-8", !narrow && "lg:grid-cols-12")}>
            <Reveal immediate delay={0.35} className={cn(!narrow && "lg:col-span-6 lg:col-start-7 lg:row-start-1")}>
              <p className="text-lg leading-snug text-muted-foreground sm:text-xl">{summary}</p>
              {children}
            </Reveal>
            {actions ? (
              <Reveal immediate delay={0.45} className={cn("flex flex-wrap items-start gap-3", !narrow && "lg:col-span-5 lg:row-start-1")}>
                {actions}
              </Reveal>
            ) : null}
          </div>
        </Container>
      </header>
      {cover ? (
        <Container className="mt-8 sm:mt-10">
          <Reveal immediate delay={0.3}>
            <Cover src={cover.src} title={cover.title} label={cover.label} priority sizes="(min-width: 1280px) 1216px, 100vw" className="aspect-[4/3] rounded-2xl sm:aspect-[21/9]" />
          </Reveal>
        </Container>
      ) : null}
    </>
  );
}

/** Sticky details column with hairline rows. */
export function DetailAside({ label, items, children }: { label: string; items: { label: string; value: React.ReactNode }[]; children?: React.ReactNode }) {
  return (
    <aside aria-label={label}>
      <div className="lg:sticky lg:top-28">
        <dl className="border-t border-border">
          {items.map((m) => (
            <div key={m.label} className="flex justify-between gap-6 border-b border-border py-4 text-sm">
              <dt className="text-muted-foreground">{m.label}</dt>
              <dd className="text-right">{m.value}</dd>
            </div>
          ))}
        </dl>
        {children}
      </div>
    </aside>
  );
}
