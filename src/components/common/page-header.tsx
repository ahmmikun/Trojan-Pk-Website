import { Container } from "./container";
import { SectionHeading } from "./section";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

/** Hero block shared by all inner pages: consistent grid backdrop, eyebrow, h1. */
export function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="bg-grid absolute inset-0" />
      <Container className="relative py-20 sm:py-28">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  );
}
