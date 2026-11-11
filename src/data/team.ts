import type { TeamMember } from "@/types/content";

/**
 * Initial profiles from the brief. Bios are intentionally limited to the
 * confirmed role; add photos (files in /public) and social links here
 * (null values are hidden in the UI).
 */
export const teamData: TeamMember[] = [
  {
    slug: "professor-abdullah",
    name: "Professor Abdullah",
    role: "Founder & AI/ML Engineer",
    bio: "Founder of Trojans PK. Works on artificial intelligence and machine learning, and leads the community's direction.",
    photo: null,
    interests: ["AI & Machine Learning"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 0,
  },
  {
    slug: "salman-ahmad",
    name: "Salman Ahmad",
    role: "Co-Founder & Full Stack AI Engineer",
    bio: "Co-founder of Trojans PK. Builds full-stack products with artificial intelligence at their core.",
    photo: null,
    interests: ["Full-Stack Development", "AI & Machine Learning"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 1,
  },
  {
    slug: "talha-irfan",
    name: "Talha Irfan",
    role: "Core Team Member & Product Engineer",
    bio: "Core team member at Trojans PK, focused on turning ideas into well-built products.",
    photo: null,
    interests: ["Product Development", "Software Engineering"],
    github: null,
    linkedin: null,
    website: null,
    otherLinks: [],
    order: 2,
  },
];
