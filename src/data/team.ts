import type { TeamMember } from "@/types/content";

/**
 * Team profiles. Bios are intentionally limited to the confirmed role; add
 * photos (files in /public) and social links here (null values are hidden in
 * the UI). `order` controls the display order.
 */
export const teamData: TeamMember[] = [
  {
    slug: "salman-ahmad",
    name: "Salman Ahmad",
    role: "Founder & Tech Lead",
    bio: "Founder of Trojans PK. Leads the community's technical direction and the projects members build together.",
    photo: "/salman.jpg",
    interests: ["Full-Stack Development", "AI & Machine Learning"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 0,
  },
  {
    slug: "professor-abdullah",
    name: "Professor Abdullah",
    role: "Community Operations Lead",
    bio: "Leads community operations at Trojans PK, keeping events, channels and member activity running smoothly.",
    // Sample stock photo (Unsplash), not Professor Abdullah. Replace with a real portrait.
    photo: "/samples/team/masked-hacker.jpg",
    interests: ["AI & Machine Learning"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 1,
  },
  {
    slug: "talha-irfan",
    name: "Talha Irfan",
    role: "AI Community Lead",
    bio: "Leads the AI community at Trojans PK. Uses AI to solve real problems and works on AI-orchestrated development, where developers direct AI agents to plan, build and ship software.",
    photo: "/talha.jpeg",
    interests: ["AI & Machine Learning", "AI-Orchestrated Development", "Problem Solving with AI"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 2,
  },
];
