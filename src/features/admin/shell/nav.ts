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

/** Admin navigation, shared by the sidebar and the command palette. */
export type NavEntry = { href: string; label: string; icon: LucideIcon; resource?: string };

export const ADMIN_NAV: { group: string | null; items: NavEntry[] }[] = [
  { group: null, items: [{ href: "/admin", label: "Overview", icon: LayoutGrid }] },
  {
    group: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays, resource: "events" },
      { href: "/admin/projects", label: "Projects", icon: FolderGit2, resource: "projects" },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, resource: "blog" },
      { href: "/admin/achievements", label: "Achievements", icon: Award, resource: "achievements" },
    ],
  },
  {
    group: "Community",
    items: [
      { href: "/admin/team", label: "Team", icon: Users, resource: "team" },
      { href: "/admin/partners", label: "Partners", icon: Handshake, resource: "partners" },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, resource: "testimonials" },
      { href: "/admin/stats", label: "Stats", icon: BarChart3, resource: "stats" },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/media", label: "Media", icon: Images },
      { href: "/admin/social", label: "Social links", icon: Link2, resource: "social" },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];
