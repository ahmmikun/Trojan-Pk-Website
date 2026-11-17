"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { clampText } from "@/lib/seo";
import { MediaThumb } from "../media/media-thumb";

/** Reads named form values live (updates on every input), for previews that mirror the form. */
export function useLiveValues(form: HTMLFormElement | null, names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  const key = names.join("|");
  useEffect(() => {
    if (!form) return;
    const read = () => {
      const data = new FormData(form);
      setValues(Object.fromEntries(key.split("|").map((n) => [n, String(data.get(n) ?? "")])));
    };
    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    // Hidden inputs (image fields) change without input events; poll lightly while mounted.
    const t = window.setInterval(read, 800);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
      window.clearInterval(t);
    };
  }, [form, key]);
  return values;
}

/** Google result and link-share previews built from the SEO fields with the same fallbacks the site uses. */
export function SeoPreview({ form, siteUrl, pathPrefix, titleField, summaryField, imageField }: { form: HTMLFormElement | null; siteUrl: string; pathPrefix: string; titleField: string; summaryField: string; imageField?: string }) {
  const v = useLiveValues(form, ["seo_title", "seo_description", "seo_image", "slug", titleField, summaryField, ...(imageField ? [imageField] : []), "noindex"]);
  const title = v.seo_title?.trim() || v[titleField]?.trim() || "Untitled";
  const description = clampText(v.seo_description?.trim() || v[summaryField]?.trim() || "Add a summary or meta description to control this snippet.");
  const image = v.seo_image?.trim() || (imageField ? v[imageField]?.trim() : "");
  const host = siteUrl.replace(/^https?:\/\//, "");
  const fullTitle = `${title} | Trojans PK`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-[0.6875rem] font-medium text-muted-foreground">Search result</p>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-muted"><Globe className="size-3.5 text-muted-foreground" aria-hidden="true" /></span>
            <div className="min-w-0 leading-tight">
              <p className="text-xs">Trojans PK</p>
              <p className="truncate text-[0.6875rem] text-muted-foreground">{host} › {pathPrefix.replace(/^\/|\/$/g, "").replace(/\//g, " › ")}{v.slug ? ` › ${v.slug}` : ""}</p>
            </div>
          </div>
          <p className="mt-2 line-clamp-1 text-[1.0625rem] leading-snug text-[#1a0dab]">{fullTitle}</p>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-[#4d5156]">{description}</p>
        </div>
        <p className="mt-1.5 text-[0.6875rem] text-muted-foreground tabular-nums">
          Title {fullTitle.length}/60 · Description {description.length}/155
          {v.noindex === "on" ? <span className="ml-2 font-medium text-amber-700">Hidden from search engines</span> : null}
        </p>
      </div>
      <div>
        <p className="mb-2 text-[0.6875rem] font-medium text-muted-foreground">Link preview (WhatsApp, LinkedIn, X)</p>
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <MediaThumb src={image || null} className="aspect-[1200/630] w-full" />
          <div className="border-t border-border p-3">
            <p className="text-[0.6875rem] text-muted-foreground uppercase">{host}</p>
            <p className="mt-0.5 line-clamp-1 text-[0.8125rem] font-medium">{title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
