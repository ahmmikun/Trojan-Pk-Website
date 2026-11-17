import { Container } from "@/components/common/container";

/**
 * Full-height status page (404, 500) under the transparent navbar. One layout for every
 * error state, so they look like the rest of the site.
 */
export function StatusPage({ code, title, message, actions }: { code: string; title: string; message: React.ReactNode; actions: React.ReactNode }) {
  return (
    <section className="bg-wash -mt-[var(--nav-h)] border-b border-border">
      <Container className="flex min-h-svh flex-col justify-center pt-[var(--nav-h)] pb-20">
        <p className="tabular font-mono text-sm text-muted-foreground">({code})</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[0.98] font-medium tracking-tighter text-balance sm:text-7xl lg:text-8xl">{title}</h1>
        <div className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-12">
          <p className="text-lg leading-snug text-muted-foreground sm:text-xl lg:col-span-5 lg:col-start-8">{message}</p>
          <div className="flex flex-wrap gap-3 lg:col-span-6 lg:row-start-1">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
