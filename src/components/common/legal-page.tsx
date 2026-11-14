import { Container } from "./container";
import { PageHeader } from "./page-header";

type Props = { eyebrow: string; title: string; updated: string; children: React.ReactNode };

/** Shared shell for long-form legal text: wide gutter label, narrow reading column. */
export function LegalPage({ eyebrow, title, updated, children }: Props) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={`Last updated: ${updated}`} />
      <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-12">
        <p className="text-sm text-muted-foreground lg:col-span-3">{eyebrow}</p>
        <div className="max-w-2xl space-y-6 text-lg leading-[1.65] text-muted-foreground lg:col-span-8 lg:col-start-5 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/30 [&_a]:underline-offset-4 [&_a:hover]:decoration-foreground">
          {children}
        </div>
      </Container>
    </>
  );
}
