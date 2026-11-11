import type { Achievement } from "@/types/content";

/**
 * Verified information only (from the project brief). Dates and details that
 * have not been confirmed are left null and are hidden in the UI.
 * Add genuine event photos / screenshots to `images` (files in /public) when available.
 */
export const achievementsData: Achievement[] = [
  {
    slug: "alibaba-cloud-ai-hackathon-pakistan-2026",
    title: "Alibaba Cloud AI Hackathon Pakistan 2026",
    subtitle: "National Finalist",
    badge: "National Finalist",
    description:
      "Trojans PK qualified through the regional technical round in Lahore and competed in the national finals in Islamabad on October 24, 2026.",
    projectName: "BolKhata",
    projectSlug: "bolkhata",
    eventSlug: "alibaba-cloud-ai-hackathon-pakistan-2026-national-finals",
    projectSummary:
      "An AI-powered voice ledger application designed to help small shopkeepers manage credit transactions and outstanding balances through voice interactions.",
    timeline: [
      {
        label: "Regional round",
        title: "Lahore regional technical qualification",
        detail: "Qualified through the regional technical round held in Lahore.",
        date: null,
      },
      {
        label: "National finals",
        title: "Islamabad national finals",
        detail: "Competed as a National Finalist in the national finals held in Islamabad.",
        date: new Date("2026-10-24T00:00:00+05:00"),
      },
    ],
    images: [],
    links: [],
  },
];
