"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-wash -mt-[var(--nav-h)] border-b border-border">
      <Container className="flex min-h-svh flex-col justify-center pt-[var(--nav-h)] pb-20">
        <p className="tabular font-mono text-sm text-muted-foreground">(500)</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[0.98] font-medium tracking-tighter sm:text-7xl lg:text-8xl">Something went wrong.</h1>
        <div className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-12">
          <p className="text-lg leading-snug text-muted-foreground sm:text-xl lg:col-span-5 lg:col-start-8">
            The page could not be loaded. Try again, or head back to the home page.
          </p>
          <div className="flex flex-wrap gap-3 lg:col-span-6 lg:row-start-1">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <RotateCcw aria-hidden="true" className="size-4" /> Try again
            </button>
            <ButtonLink href="/" variant="outline"><ArrowLeft /> Back to home</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
