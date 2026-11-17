/** URL slug from a title: "Build Weekend 2027: Lahore!" → "build-weekend-2027-lahore". */
export function toSlug(text: string, max = 80): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

/** Light clean-up while typing a slug by hand: keeps a trailing hyphen so the next word can follow. */
export function cleanSlugInput(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-+/, "").slice(0, 80);
}
