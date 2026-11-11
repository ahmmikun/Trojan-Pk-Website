import { Container } from "./container";
import { PageHeader } from "./page-header";

type Props = { eyebrow: string; title: string; updated: string; children: React.ReactNode };

/** Shared shell for long-form legal text. */
export function LegalPage({ eyebrow, title, updated, children }: Props) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={`Last updated: ${updated}`} />
      <Container size="narrow" className="py-16">
        <div className="space-y-6 text-base leading-8 text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:text-brand-blue [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </Container>
    </>
  );
}
