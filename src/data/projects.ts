import type { Project } from "@/types/content";

/**
 * Only verified projects are listed. Repository / demo links, technology
 * stack, contributors, status and publication date for BolKhata have not been
 * supplied, so they are left empty and hidden until they are filled in here.
 * Set `published: false` to keep a project off the site.
 */
export const projectsData: Project[] = [
  {
    slug: "bolkhata",
    title: "BolKhata",
    summary:
      "An AI-powered voice ledger that helps small shopkeepers manage credit transactions and outstanding balances through voice interactions.",
    content: [
      "BolKhata is an AI-powered voice ledger application designed to help small shopkeepers manage credit transactions and outstanding balances through voice interactions.",
      "",
      "The project was built by Trojans PK for the **Alibaba Cloud AI Hackathon Pakistan 2026**, where the team qualified through the Lahore regional technical round and competed as a **National Finalist** in the national finals in Islamabad on October 24, 2026.",
    ].join("\n"),
    coverImage: null,
    categorySlug: "ai-ml",
    technologies: [],
    contributors: [],
    githubUrl: null,
    liveUrl: null,
    status: null,
    badge: "National Finalist",
    isFeatured: true,
    published: true,
    publishedAt: null,
  },
];
