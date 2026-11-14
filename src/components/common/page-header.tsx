import { Container } from "./container";
import { SectionHeading } from "./section";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

/** Header block shared by all inner pages. */
export function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <header className="bg-wash relative -mt-[var(--nav-h)] overflow-hidden border-b border-border">
      <Container className="relative pt-[calc(var(--nav-h)+6rem)] pb-24 sm:pt-[calc(var(--nav-h)+8rem)] sm:pb-32">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </header>
  );
}
