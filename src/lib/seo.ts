import type { Metadata } from "next";
import type { SeoOverrides } from "@/types/content";

type DetailSeo = {
  /** Canonical path, e.g. "/events/build-weekend". */
  path: string;
  title: string;
  description: string;
  image: string | null;
  seo?: SeoOverrides;
  /** Placeholder content is never indexed. */
  isSample?: boolean;
  openGraph?: NonNullable<Metadata["openGraph"]>;
};

/** Trim to a search-snippet friendly length at a word boundary. */
export function clampText(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Metadata for a detail page. Admin SEO overrides win over the content; the image falls
 * back to the cover. Relative image paths resolve against `metadataBase` (root layout).
 */
export function detailMetadata({ path, title, description, image, seo, isSample, openGraph }: DetailSeo): Metadata {
  const metaTitle = seo?.title ?? title;
  const metaDescription = clampText(seo?.description ?? description);
  const ogImage = seo?.image ?? image;
  const noindex = Boolean(seo?.noindex || isSample);
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "article", title: metaTitle, description: metaDescription, url: path, ...(ogImage ? { images: [ogImage] } : {}), ...openGraph },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title: metaTitle, description: metaDescription, ...(ogImage ? { images: [ogImage] } : {}) },
  };
}

/** Absolute URL for JSON-LD, which needs full URLs (Supabase images are already absolute). */
export function absoluteUrl(base: string, pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
