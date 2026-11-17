"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { StatusPage } from "@/components/common/status-page";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage
      code="500"
      title="Something went wrong."
      message="The page could not be loaded. Try again, or head back to the home page."
      actions={
        <>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <RotateCcw aria-hidden="true" className="size-4" /> Try again
          </button>
          <ButtonLink href="/" variant="outline">
            <ArrowLeft /> Back to home
          </ButtonLink>
        </>
      }
    />
  );
}
