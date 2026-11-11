# Build a Premium Developer Community Website for Trojans PK

## Role & Objective

Act as a senior full-stack software engineer, UI/UX designer, product architect, and frontend specialist.

Your task is to design and develop a complete, production-ready website for **Trojans PK**, a Pakistan-based developer, technology, and open-source community.

The website should establish Trojans PK as a recognizable technology community where developers, students, designers, and innovators collaborate, build real-world products, contribute to open source, participate in hackathons, and grow together.

This must be a complete, content-rich community website (fully static, with no backend or database), not a thin landing page or a generic developer portfolio.

**Brand identity:**
- Name: Trojans PK
- Category: Developer & Open-Source Community
- Region: Pakistan
- Tagline: Learn. Build. Collaborate. Innovate.

---

## 1. About the Community

Trojans PK brings together people interested in technology and software development.

Its primary focus areas include:

- Full-Stack Development
- AI & Machine Learning
- Open Source Development
- Hackathons & Competitions
- Software Engineering
- Product Development
- Developer Networking
- Technical Learning and Collaboration

The website should communicate a strong community identity rather than making it look like a software agency or commercial company.

Highlight the importance of learning through practical projects, sharing knowledge, and collaborating with other developers.

---

## 2. Design System & Visual Identity

Create a premium, modern, developer-centric visual experience inspired by Linear, Vercel, GitHub, Raycast, and Stripe.

Use these websites as design references, not templates to copy.

### Visual direction

- Primary theme: Dark.
- Background: Deep black and charcoal.
- Text: White and muted gray.
- Accent colors: Electric blue and violet.
- Typography: Geist or Inter.
- Layout: Spacious, structured, and editorial.
- Borders: Subtle and minimal.
- Cards: Clean surfaces with intentional hover states.
- Backgrounds: Subtle grids, gradients, and technical patterns.

### Design principles

1. Strong typography and clear visual hierarchy.
2. Excellent spacing and alignment.
3. Minimal but meaningful animations.
4. Consistent components across all pages.
5. Professional presentation of projects and achievements.
6. Smooth responsive layouts on all screen sizes.
7. Strong visual distinction between sections.

### Avoid

- Generic AI-generated website templates.
- Excessive gradients and glow effects.
- Unnecessary glassmorphism.
- Excessive rounded cards.
- Random stock photography.
- Unnecessary decorative elements.
- Overloaded animations.

Create an original Trojans PK visual identity. If no official logo is provided, create a clean temporary typographic wordmark that can easily be replaced.

---

## 3. Website Structure & Pages

Build the following complete pages with consistent navigation and reusable components.

### A. Homepage (/)

The homepage should immediately communicate what Trojans PK is and encourage visitors to explore and join.

**Navigation bar**
- Trojans PK logo and wordmark.
- Home.
- About.
- Community.
- Projects.
- Events.
- Team.
- Blog.
- Join Community CTA.

Make the navbar sticky with a polished mobile navigation menu.

**Hero section**

Main headline:

"Where Developers Come Together to Build What's Next."

Supporting description:

"A community of builders, innovators, and open-source enthusiasts collaborating to shape the future of technology in Pakistan."

Include:
- Primary CTA: Join the Community.
- Secondary CTA: Explore Projects.
- Distinctive background visual.
- Subtle animated grid or technical artwork.
- Social media shortcuts.
- Professional typography and entrance animations.

**Community introduction**

Briefly explain the community's mission and what makes it different.

**What We Do**

Present the six core focus areas using visually distinct sections or icons.

**Community impact**

Display configurable statistics such as:
- Community members.
- Projects developed.
- Open-source contributions.
- Events participated in.

Never invent statistics. Hide unavailable figures or display clearly marked placeholders.

**Featured projects**

Showcase selected community projects with:
- Project name.
- Short description.
- Technology stack.
- Project thumbnail.
- GitHub link.
- Live demo link.

**Featured achievement**

Highlight the Alibaba Cloud AI Hackathon Pakistan 2026 national finalist achievement.

**Events preview**

Show upcoming and previous community events.

**Team preview**

Introduce the core leadership team.

**Community testimonials**

Create a reusable testimonial section populated only with genuine member feedback.

**Final CTA**

"Your Next Big Idea Could Start Here."

Include a prominent Join Community button.

**Footer**

Include:
- Logo and community description.
- Main navigation.
- All configured social links.
- Community invitation links.
- Contact information.
- Privacy Policy and Terms of Service.
- Copyright information.

---

### B. About Us (/about)

Create a dedicated page explaining the identity and purpose of Trojans PK.

Sections:
- Who We Are.
- Our Story.
- Our Mission.
- Our Vision.
- Core Values.
- Community Journey.
- Important Milestones.
- Leadership Introduction.

Core values:
- Learning by Building.
- Open Collaboration.
- Technical Excellence.
- Knowledge Sharing.
- Innovation.
- Community First.

Use a timeline to present significant community milestones and achievements.

---

### C. Community (/community)

Build a page focused on community participation and member engagement.

Include:
- Community introduction.
- Why Join Trojans PK?
- Benefits of membership.
- Technical interest groups.
- Collaboration opportunities.
- Open-source contribution opportunities.
- Community guidelines.
- Frequently asked questions.

Create prominent joining sections for WhatsApp, Discord, and Telegram.

Make each community link configurable through the centralized social links system.

---

### D. Projects (/projects)

Build a professional project showcase.

Display community projects in a clean grid or editorial layout.

Each project should contain:
- Project title.
- Description.
- Cover image.
- Technologies used.
- Category.
- Contributors.
- GitHub repository.
- Live demo.
- Project status.
- Publication date.

Include:
- Search functionality.
- Category filters.
- Technology filters.
- Featured project section.
- Individual project detail pages.

Project categories:
- AI/ML.
- Web Development.
- Mobile Development.
- Open Source.
- Developer Tools.
- Other.

---

### E. Events (/events)

Create an events platform for community activities.

Support:
- Hackathons.
- Workshops.
- Technical sessions.
- Meetups.
- Competitions.
- Community gatherings.

Each event should display:
- Event title.
- Description.
- Date and time.
- Location.
- Event image.
- Registration link.
- Organizer.
- Event status.

Separate upcoming and previous events.

Include individual event detail pages.

---

### F. Team (/team)

Create a professional team directory.

Initial profiles:

1. **Professor Abdullah** — Founder & AI/ML Engineer.
2. **Salman Ahmad** — Co-Founder & Full Stack AI Engineer.
3. **Talha Irfan** — Core Team Member & Product Engineer.

Each profile should support:
- Profile photograph.
- Name and role.
- Professional biography.
- Technical interests.
- GitHub.
- LinkedIn.
- Personal website.
- Other social links.

Use a premium editorial layout rather than a generic employee directory.

Keep all team information in a single data file (`src/data/team.ts`) so it can be edited without touching components.

---

### G. Blog (/blog)

Build a technical publishing platform for community knowledge sharing.

Categories:
- Software Engineering.
- AI & Machine Learning.
- Open Source.
- Hackathon Experiences.
- Tutorials.
- Community Announcements.

Features:
- Blog listing.
- Search and category filters.
- Individual article pages.
- Author profiles.
- Publication date.
- Reading time.
- Related articles.
- SEO-friendly URLs.
- Social sharing links.

Articles are authored as Markdown files with front matter (title, excerpt, category, tags, author, date, `draft`, `featured`) in `content/blog/`. Setting `draft: true` keeps an article out of the published site, listings and sitemap. Publishing means committing the file and rebuilding.

---

### H. Join Community (/join)

Create a dedicated membership onboarding experience.

Explain:
- Who can join.
- What members gain.
- How participation works.
- Community expectations.
- Available communication platforms.

The site has no backend and no database, so it does not collect or store applications itself. Membership applications are collected by an external form service (for example Google Forms) whose URL is set in one configuration value (`applicationFormUrl`).

The external form should ask for:
- Full name.
- Email address.
- City and country.
- GitHub profile.
- LinkedIn profile.
- Technical interests.
- Experience level.
- Why they want to join.

Requirements:
- The Apply button appears only when `applicationFormUrl` is configured; otherwise the page offers the community channels and official email (when configured) instead. No non-functional buttons.
- The page states clearly that applications are reviewed manually and are never auto-approved.
- The page explains what information the external form collects and links to the Privacy Policy.

---

## 4. Social Media & External Links Management

Create a centralized social media management system.

This is an important feature. All community links must be managed from one location instead of being independently hardcoded across components.

### Official community links

- WhatsApp Community: https://chat.whatsapp.com/HosYEWJuqnvEn21xO0tMqU
- Discord Server: https://discord.gg/NGXDASQmfb
- Telegram Channel: https://t.me/+HM6YJY9GG8MwM2Nk
- Instagram: https://www.instagram.com/trojans_pk
- LinkedIn: https://www.linkedin.com/company/trojan-pk
- GitHub Organization: https://github.com/trojan-pk

### Additional supported platforms

- Facebook.
- YouTube.
- X (Twitter).
- TikTok.
- Official Email.
- Official Website.

### Functional requirements

1. Create reusable social link components.
2. Display social icons in the footer, community page, contact section, and navbar where appropriate.
3. Use recognizable brand icons where available.
4. Open external links in new tabs with secure link attributes.
5. Hide platforms without configured URLs.
6. Store links in one centralized configuration file (`src/config/social-links.ts`).
7. Add, edit, remove, and reorder platforms by editing that file (order is the array order).
8. Support custom labels and platform icons.
9. Add copy-to-clipboard functionality for community invitation links.
10. Make social links accessible and responsive.

Ensure that updating a social URL in the configuration file updates every location where that link appears.

---

## 5. Featured Achievement — Alibaba Cloud AI Hackathon Pakistan 2026

Create a visually prominent achievement section highlighting Trojans PK's participation in the competition.

**Featured project: BolKhata**

An AI-powered voice ledger application designed to help small shopkeepers manage credit transactions and outstanding balances through voice interactions.

Highlight:
- National Finalist achievement.
- Lahore regional technical qualification.
- Islamabad national finals.
- October 24, 2026.

Create an achievement timeline and project showcase with genuine event images, project screenshots, and relevant links where available.

Use verified information only. Do not invent awards, rankings, or competition statistics.

---

## 6. Technology Stack & Architecture

Use a modern, scalable **static** architecture. The site has **no backend, no database, no authentication and no admin dashboard**. Everything is generated at build time and served as static files from any static host.

**Frontend**
- Next.js with App Router, configured for static export (`output: "export"`).
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Framer Motion.
- Lucide Icons.

**Content (no database)**
- Typed data files in the repository for projects, events, team, achievements, testimonials, statistics and social links.
- Markdown files with front matter for blog articles (and long-form project/event descriptions).
- Images stored in `public/`.
- A modular content layer that reads these files at build time. Components never read files directly.

**Not used (by design)**
- No Server Actions, API routes, or any server-side runtime code.
- No PostgreSQL / Prisma, no Auth.js, no admin routes.
- No server-side forms. Any form is handled by a third-party service linked from the site.

Use current stable and compatible package versions.

### Architecture requirements

Organize code into:
- App routes and layouts.
- Reusable components.
- Feature modules.
- Content data files and Markdown content.
- Content layer (typed loaders, filtering helpers).
- Shared types.
- Configuration.
- Helper functions.

Keep content separate from presentation components.

Avoid oversized components, unnecessary client-side rendering, duplicated code, and hardcoded content.

---

## 7. Content Management (File-Based)

There is no admin dashboard. Maintainers update the site by editing files in the repository and redeploying.

**Content that must be editable through files**
- Projects (`src/data/projects.ts`).
- Events (`src/data/events.ts`).
- Team members (`src/data/team.ts`).
- Blog posts (`content/blog/*.md`).
- Testimonials (`src/data/testimonials.ts`).
- Achievements (`src/data/achievements.ts`).
- Community announcements (blog category "Community Announcements").
- Community statistics (`src/data/stats.ts`).
- Social media links and community invitation URLs (`src/config/social-links.ts`).
- Contact information, application form URL, and general settings (`src/config/site.ts`).
- SEO metadata (per-page `metadata`, plus site defaults in `src/config/site.ts`).

**Content workflow requirements**
- Draft and publish: `draft: true` front matter (blog) or `published: false` (data files) keeps an item off the site.
- Featured content: a `featured` flag on projects, events, and posts.
- Preview before publishing: run the development server locally; drafts are visible only in development.
- Images: placed in `public/` and referenced by path.
- Content is validated at build time with Zod schemas so a malformed entry fails the build with a clear message.
- A short `CONTENT.md` guide explains how to add each type of content.

Because the site is static, there are no privileged operations to protect. The repository's access controls (GitHub permissions and review) govern who can change content.

---

## 8. Content Model

Define TypeScript types (and build-time Zod validators) for:
- Project and ProjectCategory.
- Event and EventType.
- TeamMember.
- BlogPost and BlogCategory.
- Testimonial.
- SocialLink.
- Achievement.
- CommunityStat.
- SiteSettings.

Use unique slugs, explicit status fields, and publication dates. Fail the build on duplicate slugs or invalid references (for example a post author that does not exist).

Provide realistic initial content using the information supplied in this prompt. Keep unverified information out of the content.

---

## 9. Performance, SEO & Security

### Performance
- Optimize images (pre-compress assets; static export serves them as-is).
- Use lazy loading where appropriate.
- Avoid unnecessary JavaScript.
- Use server components by default.
- Generate every page at build time.
- Paginate or "show more" long lists.

### SEO
- Unique page titles and descriptions.
- Open Graph metadata.
- Social sharing previews.
- Sitemap.xml.
- Robots.txt.
- Canonical URLs.
- Semantic HTML.
- Structured data where appropriate.

### Security
- Validate all content at build time.
- Render user-authored Markdown without raw HTML.
- Open external links with `rel="noopener noreferrer"`; allow only http(s) and mailto URLs.
- Send security headers where the host allows (CSP, X-Content-Type-Options, Referrer-Policy) and document them.
- Prevent common web vulnerabilities.
- Never commit secrets. The site needs none.
- Sanitize user-generated content appropriately.

### Accessibility
- Keyboard navigation.
- Accessible forms.
- Proper color contrast.
- Semantic headings.
- Screen-reader-friendly labels.
- Reduced-motion support.

---

## 10. Development Workflow

Follow a structured implementation process.

**Phase 1 — Repository Inspection**
- Inspect existing files and dependencies.
- Identify existing functionality and assets.
- Understand the current project architecture.
- Prepare an implementation plan.

**Phase 2 — Design Foundation**
- Establish the visual identity.
- Configure typography and colors.
- Create reusable UI components.
- Build the global navigation and footer.

**Phase 3 — Frontend Development**
- Implement all public pages.
- Develop responsive layouts.
- Add animations and interactions.
- Implement reusable content sections.

**Phase 4 — Content Layer & Static Build**
- Remove backend, database and admin code and dependencies.
- Create the typed content layer with build-time Zod validation.
- Move blog posts to Markdown files with front matter and draft support.
- Centralize site settings, including the external application form URL.
- Configure static export.

**Phase 5 — Content Authoring & Quality**
- Write the `CONTENT.md` guide for adding projects, events, team members, posts and links.
- Add featured/published flags and development-only draft preview.
- Add security headers configuration and structured data checks.
- Validate content and link integrity at build time.

**Phase 6 — Testing**
- Test all routes.
- Verify content validation fails clearly on bad data.
- Check mobile responsiveness.
- Fix TypeScript and console errors.
- Verify all external links.

**Phase 7 — Production Readiness**
- Run linting and type checking.
- Run the production static export.
- Document content editing.
- Prepare deployment configuration for static hosting (for example Vercel, Netlify, Cloudflare Pages or GitHub Pages).
- Verify the exported site.

---

## 11. Important AI Coding Agent Instructions

Work like a professional engineering team.

1. Inspect the repository before changing anything.
2. Preserve existing working code and assets.
3. Do not unnecessarily rewrite the entire project.
4. Do not stop after building the homepage.
5. Implement every requested page and core feature.
6. Prioritize design quality and real functionality equally.
7. Write clean, maintainable, type-safe code.
8. Avoid fake statistics and fabricated testimonials.
9. Do not create non-functional buttons or placeholder interactions.
10. Keep social URLs and website content configurable.
11. Do not leave critical features as TODO comments.
12. Run linting, type checking, and production builds.
13. Fix errors before declaring completion.
14. Maintain consistent UI across all pages.
15. Document any missing external credentials or configuration requirements.

If an external service is unavailable, build the integration structure and document the required configuration. Never claim an integration works until it has been tested.

---

## 12. Final Deliverables

The completed project must include:

- Complete responsive Trojans PK website.
- All requested public pages.
- Centralized social media management.
- Dynamic project showcase (filterable, built from content files).
- Events platform.
- Team directory.
- Blog platform (Markdown-based).
- Membership onboarding with a configurable external application form.
- Featured achievement section.
- File-based content management with a `CONTENT.md` guide.
- Build-time content validation.
- Reusable UI component system.
- SEO configuration.
- Complete README.
- Static hosting deployment instructions.

## FINAL OBJECTIVE

Transform Trojans PK into a professional digital home for Pakistan's developer and open-source community.

A first-time visitor should immediately understand:

- What Trojans PK is.
- What the community stands for.
- What technologies its members work with.
- What projects it builds.
- What achievements it has earned.
- Who leads the community.
- How to connect through its social platforms.
- How to become a member.

The website should feel like a serious, established technology community with a distinctive identity and a scalable technical foundation.

**Design like a premium technology brand. Engineer like a professional team. Build for long-term community growth.**