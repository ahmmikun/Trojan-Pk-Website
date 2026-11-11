"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  label: string;
  className?: string;
};

type State = "idle" | "copied" | "failed";

/** Copies an invitation link to the clipboard with an accessible live status. */
export function CopyLinkButton({ value, label, className }: Props) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    let next: State = "copied";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      next = "failed";
    }
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={copy} className={className}>
        {state === "copied" ? <Check className="text-success" aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {/* Visible text starts the accessible name (WCAG 2.5.3); the hidden suffix names the platform. */}
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy link"}
        <span className="sr-only"> for {label}</span>
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? `${label} link copied to clipboard` : state === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
