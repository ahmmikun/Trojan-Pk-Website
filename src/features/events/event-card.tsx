import { ArrowUpRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { Chip } from "@/components/common/chip";
import { Cover } from "@/components/common/cover";
import type { MediaItem } from "@/components/common/media-grid";
import { eventDateLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, type CommunityEvent } from "@/types/content";

export const eventTypeLabel = (t: CommunityEvent["type"]) => EVENT_TYPES.find((x) => x.value === t)?.label ?? "Event";

const statusLabel: Record<CommunityEvent["status"], string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Happening now",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function EventStatusChip({ status }: { status: CommunityEvent["status"] }) {
  return <Chip tone={status === "UPCOMING" || status === "ONGOING" ? "success" : "default"}>{statusLabel[status]}</Chip>;
}

/** Maps an event to a tile for <MediaGrid>. */
export function eventToMedia(event: CommunityEvent): MediaItem {
  const open = event.status === "UPCOMING" || event.status === "ONGOING";
  return {
    href: `/events/${event.slug}`,
    title: event.title,
    subtitle: [eventTypeLabel(event.type), event.location].filter(Boolean).join(" · "),
    meta: event.startsAt ? `© ${event.startsAt.getFullYear()}` : null,
    image: event.image,
    badge: open ? statusLabel[event.status] : null,
  };
}

export function EventCard({ event, className }: { event: CommunityEvent; className?: string }) {
  const date = eventDateLabel(event);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:border-foreground/25 hover:bg-surface-2",
        className,
      )}
    >
      <Cover src={event.image} title={event.title} label={eventTypeLabel(event.type)} className="border-b border-border" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{eventTypeLabel(event.type)}</Chip>
          <EventStatusChip status={event.status} />
        </div>
        <h3 className="mt-4 text-lg font-medium tracking-tight">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
            <ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          {date ? (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Date</dt>
              <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
              <dd>{date}</dd>
            </div>
          ) : null}
          {event.location ? (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              <dd>{event.location}</dd>
            </div>
          ) : null}
          {event.organizer ? (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Organizer</dt>
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              <dd>{event.organizer}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
