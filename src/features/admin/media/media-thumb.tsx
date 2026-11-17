"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Preview of any stored image value (/public path or Supabase URL). A plain <img> on
 * purpose: admin previews must show whatever is stored, even values next/image would reject.
 */
export function MediaThumb({ src, alt = "", className, fit = "cover" }: { src: string | null | undefined; alt?: string; className?: string; fit?: "cover" | "contain" }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <span className={cn("grid place-items-center bg-muted text-muted-foreground/60", className)} aria-hidden={alt ? undefined : true} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        <ImageIcon className="size-4" aria-hidden="true" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see component comment
    <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} onError={() => setFailed(src)} className={cn("bg-muted", fit === "cover" ? "object-cover" : "object-contain", className)} />
  );
}
