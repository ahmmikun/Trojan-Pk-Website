import type { CommunityStat } from "@/types/content";

/**
 * Community statistics shown on the homepage.
 *
 * Never invent numbers. A `value` of null hides that stat, and the whole
 * "Community impact" section is hidden until at least one real value is set.
 * To publish a figure, replace null with the verified number.
 */
export const statsData: CommunityStat[] = [
  { key: "members", label: "Community members", value: null },
  { key: "projects", label: "Projects developed", value: null },
  { key: "contributions", label: "Open-source contributions", value: null },
  { key: "events", label: "Events participated in", value: null },
];
