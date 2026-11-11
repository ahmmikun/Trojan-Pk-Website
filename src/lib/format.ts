const TZ = "Asia/Karachi";

export function formatDate(date: Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ, ...opts }).format(date);
}

export function formatDateTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
    timeZoneName: "short",
  }).format(date);
}

/** True when the date carries a meaningful time (not midnight in Karachi). */
export function hasTime(date: Date | null | undefined): boolean {
  if (!date) return false;
  const t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(date);
  return t !== "00:00" && t !== "24:00";
}

export function eventDateLabel(e: { startsAt: Date | null; dateLabel: string | null }): string | null {
  if (e.dateLabel) return e.dateLabel;
  return hasTime(e.startsAt) ? formatDateTime(e.startsAt) : formatDate(e.startsAt);
}

/** Estimated reading time in whole minutes (min 1) at 220 wpm. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString();
}
