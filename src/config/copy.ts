import {
  BookOpenCheck,
  BrainCircuit,
  Code2,
  GitBranch,
  Handshake,
  Layers,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Editorial copy shared across pages. Projects, events, people, stats and blog posts live in src/data and content/blog. */

/** `image` is an illustrative stock photo (Unsplash), not a photo of a Trojans PK event. */
export type FocusArea = { title: string; description: string; icon: LucideIcon; image: string };

export const focusAreas: FocusArea[] = [
  {
    title: "Full-Stack Development",
    description: "Design and ship complete web products, from interface to database, with modern tooling.",
    icon: Code2,
    image: "/samples/focus/fullstack.jpg",
  },
  {
    title: "AI & Machine Learning",
    description: "Explore, prototype and apply machine learning to problems that matter locally.",
    icon: BrainCircuit,
    image: "/samples/focus/ai.jpg",
  },
  {
    title: "Open Source",
    description: "Contribute to real repositories, learn collaborative workflows and give back to the ecosystem.",
    icon: GitBranch,
    image: "/samples/focus/opensource.jpg",
  },
  {
    title: "Hackathons & Competitions",
    description: "Team up, build under pressure and represent Pakistan's developers on bigger stages.",
    icon: Trophy,
    image: "/samples/focus/hackathons.jpg",
  },
  {
    title: "Software Engineering & Product",
    description: "Learn how good software is planned, structured, tested and turned into useful products.",
    icon: Layers,
    image: "/samples/focus/engineering.jpg",
  },
  {
    title: "Networking & Learning",
    description: "Share knowledge, find collaborators and grow alongside people who build.",
    icon: Users,
    image: "/samples/focus/networking.jpg",
  },
];

export type Value = { title: string; description: string; icon: LucideIcon };

export const coreValues: Value[] = [
  { title: "Learning by Building", description: "We learn fastest by shipping real projects, not by collecting tutorials.", icon: Wrench },
  { title: "Open Collaboration", description: "Ideas, code and credit are shared openly. Anyone can contribute and be heard.", icon: Handshake },
  { title: "Technical Excellence", description: "We care about craft: readable code, sound architecture and honest engineering.", icon: ShieldCheck },
  { title: "Knowledge Sharing", description: "What one member learns, everyone should be able to learn.", icon: BookOpenCheck },
  { title: "Innovation", description: "We try new tools and ideas, and we build things that did not exist yesterday.", icon: Lightbulb },
  { title: "Community First", description: "The community's growth comes before any individual's ambition.", icon: Sparkles },
];

export const aboutCopy = {
  whoWeAre:
    "Trojans PK is a Pakistan-based community of developers, students, designers and innovators. We are not an agency or a company. We are people who build things together, learn in public and help each other grow.",
  story: [
    "Trojans PK is built on a simple idea: developers in Pakistan grow faster when they build together instead of alone. Practical projects, shared knowledge and real collaboration are the heart of everything we do.",
    "That approach took the team to the national finals of the Alibaba Cloud AI Hackathon Pakistan 2026 with BolKhata, an AI-powered voice ledger for small shopkeepers.",
  ],
  mission:
    "To give developers in Pakistan a place to learn through practical projects, share knowledge openly and collaborate on products and open-source work that make a real difference.",
  vision:
    "A recognised Pakistani technology community where builders from every city find collaborators, mentors and opportunities, and shape the future of technology in the country.",
};

export const communityBenefits = [
  { title: "Build real projects", description: "Join teams working on products and open-source ideas, not just exercises.", icon: Rocket },
  { title: "Learn from peers", description: "Ask questions, review each other's work and share what you discover.", icon: BookOpenCheck },
  { title: "Find collaborators", description: "Meet developers, designers and AI engineers to build with.", icon: Users },
  { title: "Compete and grow", description: "Take part in hackathons and competitions as a team.", icon: Trophy },
];

export const interestGroups = [
  { title: "Full-Stack & Web", description: "Frontend, backend, databases and deployment." },
  { title: "AI & Machine Learning", description: "Models, data, applied AI products and research reading." },
  { title: "Open Source", description: "Finding projects, making first contributions and maintaining repos." },
  { title: "Hackathons", description: "Team formation, ideation and shipping under a deadline." },
  { title: "Product & Design", description: "Product thinking, UI/UX and turning ideas into usable software." },
  { title: "Software Engineering", description: "Architecture, testing, tooling and engineering practice." },
];

export const collaborationOpportunities = [
  "Join a community project team or start your own",
  "Pair up with another member to learn a new stack",
  "Form a team for the next hackathon or competition",
  "Write a technical article for the community blog",
  "Present a short technical session or workshop",
];

export const openSourceOpportunities = [
  "Contribute to repositories in the Trojans PK GitHub organization",
  "Get guidance on making your first pull request",
  "Review code and give constructive feedback",
  "Improve documentation and developer experience",
];

export const guidelines = [
  { title: "Be respectful", description: "Treat everyone with courtesy. Disagree with ideas, never with people." },
  { title: "Be inclusive", description: "Beginners and experts are both welcome. Help others without gatekeeping." },
  { title: "Share generously", description: "Give credit, share what you learn and help others get unstuck." },
  { title: "Stay on topic and avoid spam", description: "Keep conversations relevant. No unsolicited promotion or repeated advertising." },
  { title: "Build in good faith", description: "Respect licences, other people's work and the community's reputation." },
];

export const faqs = [
  {
    q: "Who can join Trojans PK?",
    a: "Anyone interested in technology and software development: students, self-taught developers, professionals, designers and AI enthusiasts, at any experience level.",
  },
  {
    q: "Do I need to be an expert?",
    a: "No. The community is for learning. Beginners are welcome as long as they are willing to learn, contribute and respect others.",
  },
  {
    q: "How does membership work?",
    a: "Use the application on the Join page. Every application is reviewed by the team; no application is approved automatically.",
  },
  {
    q: "Where does the community talk?",
    a: "Primarily on WhatsApp, Discord and Telegram. Links are available on the Community and Join pages.",
  },
  {
    q: "Can I contribute to projects or events?",
    a: "Yes. Members can contribute to community projects, propose workshops and sessions, and write for the blog.",
  },
  {
    q: "I am outside Pakistan. Can I join?",
    a: "Trojans PK is Pakistan-focused, but applications from anywhere are reviewed. Include your city and country in the form.",
  },
];

export const joinCopy = {
  /** What the external application form asks for (keep in sync with the form). */
  applicationFields: [
    "full name",
    "email address",
    "city and country",
    "GitHub profile",
    "LinkedIn profile",
    "technical interests",
    "experience level",
    "why you want to join",
  ],
  whoCanJoin: [
    "Students and self-taught developers",
    "Working software engineers and AI practitioners",
    "Designers and product thinkers",
    "Anyone excited to learn by building",
  ],
  whatYouGain: [
    "A network of builders across Pakistan",
    "Real projects to contribute to",
    "Hackathon and competition teammates",
    "A place to share and receive technical knowledge",
  ],
  howItWorks: [
    { step: "Apply", detail: "Fill in the membership application form." },
    { step: "Review", detail: "The team reviews every application manually." },
    { step: "Connect", detail: "Join our community channels and start taking part in projects, events and discussions." },
  ],
  expectations: [
    "Follow the community guidelines",
    "Participate actively and help others",
    "Share what you learn",
  ],
};
