"use client";

import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container size="narrow" className="py-32 text-center">
      <p className="font-mono text-sm tracking-[0.2em] text-brand-blue">ERROR</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        The page could not be loaded. Try again, or head back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="outline">Back to home</ButtonLink>
      </div>
    </Container>
  );
}
