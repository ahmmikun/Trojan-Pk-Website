import {
  Award,
  BarChart3,
  CalendarDays,
  FolderGit2,
  Handshake,
  Images,
  LayoutGrid,
  Link2,
  MessageSquareQuote,
  Newspaper,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { IconTone } from "@/components/admin-ui/display";

/** Admin navigation, shared by the sidebar, top bar breadcrumbs, command palette and page headers. */
export type NavEntry = { href: string; label: string; icon: LucideIcon; tone: IconTone; resource?: string };

export const ADMIN_NAV: { group: string | null; items: NavEntry[] }[] = [
  { group: null, items: [{ href: "/admin", label: "Overview", icon: LayoutGrid, tone: "zinc" }] },
  {
    group: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays, tone: "blue", resource: "events" },
      { href: "/admin/projects", label: "Projects", icon: FolderGit2, tone: "violet", resource: "projects" },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, tone: "sky", resource: "blog" },
      { href: "/admin/achievements", label: "Achievements", icon: Award, tone: "amber", resource: "achievements" },
    ],
  },
  {
    group: "Community",
    items: [
      { href: "/admin/team", label: "Team", icon: Users, tone: "emerald", resource: "team" },
      { href: "/admin/partners", label: "Partners", icon: Handshake, tone: "rose", resource: "partners" },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, tone: "violet", resource: "testimonials" },
      { href: "/admin/stats", label: "Stats", icon: BarChart3, tone: "sky", resource: "stats" },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/media", label: "Media", icon: Images, tone: "amber" },
      { href: "/admin/social", label: "Social links", icon: Link2, tone: "blue", resource: "social" },
      { href: "/admin/settings", label: "Settings", icon: Settings, tone: "zinc" },
    ],
  },
];

export const NAV_ITEMS = ADMIN_NAV.flatMap((g) => g.items);

/** The nav entry for a path ("/admin/events/123" → Events). */
export function navFor(pathname: string): NavEntry | undefined {
  return NAV_ITEMS.filter((i) => i.href !== "/admin").find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`)) ?? (pathname === "/admin" ? NAV_ITEMS[0] : undefined);
}
