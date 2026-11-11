import type { CommunityEvent } from "@/types/content";

/** Only the verified hackathon is included. Organizer and registration are unconfirmed, so left null. */
export const eventsData: CommunityEvent[] = [
  {
    slug: "alibaba-cloud-ai-hackathon-pakistan-2026-national-finals",
    title: "Alibaba Cloud AI Hackathon Pakistan 2026: National Finals",
    summary:
      "Trojans PK competed as a National Finalist with BolKhata, an AI-powered voice ledger for small shopkeepers.",
    content: [
      "Trojans PK qualified through the **Lahore regional technical round** and competed in the **national finals in Islamabad** on October 24, 2026.",
      "",
      "The team presented **BolKhata**, an AI-powered voice ledger application designed to help small shopkeepers manage credit transactions and outstanding balances through voice interactions.",
    ].join("\n"),
    type: "HACKATHON",
    image: null,
    startsAt: new Date("2026-10-24T00:00:00+05:00"),
    endsAt: null,
    dateLabel: null,
    location: "Islamabad, Pakistan",
    organizer: null,
    registrationUrl: null,
    status: "COMPLETED",
    isFeatured: true,
    published: true,
  },
];
