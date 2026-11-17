"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** Copy button for code blocks. Works without JS-heavy dependencies; announces the result. */
export function CodeCopy({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setState("done");
        } catch {
          setState("failed");
        }
        setTimeout(() => setState("idle"), 1600);
      }}
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-400"
      aria-label={state === "done" ? "Copied" : "Copy code"}
    >
      {state === "done" ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      <span aria-live="polite">{state === "done" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}</span>
    </button>
  );
}
