import { type NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { aboutCopy, coreValues, faqs, focusAreas, guidelines, joinCopy } from "@/config/copy";
import { getPosts, getPostBySlug } from "@/content/blog";
import { getEvents, getEventBySlug } from "@/content/events";
import { getProjects, getProjectBySlug } from "@/content/projects";
import { getFeaturedAchievement, getPartners, getStats } from "@/content/site-content";
import { getInviteLinks, getSocialLinks } from "@/content/social";
import { getTeam } from "@/content/team";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function markdownResponse(content: string, status = 200) {
  return new NextResponse(content.trim() + "\n", {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": status === 404 ? "no-store" : "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

function renderNotFound(path: string) {
  return markdownResponse(
    `# 404 Not Found

The requested path "${path}" does not exist on Trojans PK.

Looking for something else? Explore our documentation, sitemap, or AI instructions:
- [Homepage](${siteConfig.url}/)
- [About Trojans PK](${siteConfig.url}/about)
- [Contact](${siteConfig.url}/contact)
- [Community Discussions](${siteConfig.url}/community)
- [Projects](${siteConfig.url}/projects)
- [Events & Hackathons](${siteConfig.url}/events)
- [Team](${siteConfig.url}/team)
- [Blog](${siteConfig.url}/blog)
- [Join the Community](${siteConfig.url}/join)
- [XML Sitemap](${siteConfig.url}/sitemap.xml)
- [LLMs Instructions](${siteConfig.url}/llms.txt)
`,
    404,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get("path") || "/";
  const path = rawPath.replace(/\/+$/, "") || "/";

  // 1. Homepage
  if (path === "/") {
    const [stats, achievement, social, partners] = await Promise.all([
      getStats(),
      getFeaturedAchievement(),
      getSocialLinks(),
      getPartners(),
    ]);

    const md = `# ${siteConfig.name} | Developer & Open-Source Community in Pakistan

> ${siteConfig.tagline}
> ${siteConfig.description}

## What We Do (Six Ways We Grow Together)
${focusAreas.map((f) => `- **${f.title}**: ${f.description}`).join("\n")}

## Our Mission
A place to learn by building, together. Trojans PK brings developers, students, designers and innovators together to share knowledge, contribute to open source and build real products.

### Principles
- **Community, not company**: No clients, no agency work. Members build and learn for themselves and for each other.
- **Projects over theory**: We value shipped work: products, open-source contributions and hackathon entries.
- **Rooted in Pakistan**: Built by developers in Pakistan, for developers in Pakistan, with a global standard of craft.

${
  achievement
    ? `## Featured Achievement: ${achievement.title}
${achievement.subtitle}
${achievement.description}
${achievement.timeline.map((t) => `- **${t.title}** (${t.label}): ${t.detail}`).join("\n")}
`
    : ""
}
${
  stats.length > 0
    ? `## Community Impact
${stats.map((s) => `- **${s.label}**: ${s.value.toLocaleString("en-US")}${s.suffix ?? ""}`).join("\n")}
`
    : ""
}
## Core Pages & Links
- [About Trojans PK](${siteConfig.url}/about): Our origin, core values, mission, and leadership.
- [Contact](${siteConfig.url}/contact): Email (talha@trojanspk.com), Lahore location, and inquiries.
- [Community](${siteConfig.url}/community): Discussion channels, interest groups, and guidelines.
- [Projects](${siteConfig.url}/projects): Open-source and member-shipped products like BolKhata.
- [Events](${siteConfig.url}/events): Hackathons, DevDays, and workshops.
- [Team](${siteConfig.url}/team): Meet the core team and founder.
- [Blog](${siteConfig.url}/blog): Engineering tutorials and community write-ups.
- [Join](${siteConfig.url}/join): Community membership application.
- [Sitemap](${siteConfig.url}/sitemap.xml): Complete URL index.
- [LLMs Instructions](${siteConfig.url}/llms.txt): Machine-readable instructions for AI agents.

## Community Channels
${social.filter((s) => s.isVisible && s.href).map((s) => `- [${s.label}](${s.href})`).join("\n")}
`;
    return markdownResponse(md);
  }

  // 2. About
  if (path === "/about") {
    const md = `# About ${siteConfig.name}

> ${aboutCopy.whoWeAre}

## Mission & Vision
- **Mission**: ${aboutCopy.mission}
- **Vision**: ${aboutCopy.vision}

## Our Story
${aboutCopy.story.join("\n\n")}

## Core Values
${coreValues.map((v) => `- **${v.title}**: ${v.description}`).join("\n")}

## Community Guidelines
${guidelines.map((g) => `- **${g.title}**: ${g.description}`).join("\n")}

- [Meet the Team](${siteConfig.url}/team)
- [Contact Us](${siteConfig.url}/contact)
- [Join the Community](${siteConfig.url}/join)
`;
    return markdownResponse(md);
  }

  // 3. Contact
  if (path === "/contact") {
    const md = `# Contact ${siteConfig.name}

> Reach out to Trojans PK for partnerships, hackathon collaborations, event sponsorships, and membership questions.

## Direct Contact Information
- **Official Email**: talha@trojanspk.com
- **Headquarters / Base**: Lahore, Punjab, Pakistan
- **Website**: ${siteConfig.url}

## Community Discussion Channels
- **WhatsApp Community**: https://chat.whatsapp.com/HosYEWJuqnvEn21xO0tMqU
- **Discord Server**: https://discord.gg/NGXDASQmfb
- **Telegram Channel**: https://t.me/+HM6YJY9GG8MwM2Nk
- **GitHub Organization**: https://github.com/trojan-pk
- **LinkedIn**: https://www.linkedin.com/company/trojan-pk

## Frequently Asked Questions
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

- [Apply for Membership](${siteConfig.url}/join)
- [Explore Projects](${siteConfig.url}/projects)
`;
    return markdownResponse(md);
  }

  // 4. Community
  if (path === "/community") {
    const invites = await getInviteLinks();
    const md = `# Trojans PK Community

> Trojans PK is where developers, students and designers across Pakistan ask questions, share work and team up on real projects.

## Active Channels
${invites.map((i) => `- [${i.label}](${i.href}): ${i.description ?? ""}`).join("\n")}

## Community Guidelines
${guidelines.map((g) => `- **${g.title}**: ${g.description}`).join("\n")}

## Frequently Asked Questions
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

- [Apply to Join](${siteConfig.url}/join)
- [Contact the Team](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 5. Projects
  if (path === "/projects") {
    const projects = await getProjects();
    const md = `# Projects | ${siteConfig.name}

> Software products, hackathon solutions, and open-source repositories built by the Trojans PK community.

${projects
  .map(
    (p) => `## [${p.title}](${siteConfig.url}/projects/${p.slug})
- **Summary**: ${p.summary}
- **Status**: ${p.status ?? "Active"}
- **Technologies**: ${p.technologies.join(", ")}
${p.githubUrl ? `- **GitHub**: ${p.githubUrl}` : ""}
${p.liveUrl ? `- **Live**: ${p.liveUrl}` : ""}`,
  )
  .join("\n\n")}

- [Back to Home](${siteConfig.url}/)
- [Submit an Idea](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 5b. Project detail: /projects/:slug
  if (path.startsWith("/projects/")) {
    const slug = path.replace("/projects/", "");
    const project = await getProjectBySlug(slug);
    if (!project) return renderNotFound(path);

    const md = `# ${project.title}

> ${project.summary}

- **Category**: ${project.categorySlug}
- **Status**: ${project.status ?? "Active"}
- **Technologies**: ${project.technologies.join(", ")}
${project.githubUrl ? `- **GitHub Repository**: ${project.githubUrl}` : ""}
${project.liveUrl ? `- **Live URL**: ${project.liveUrl}` : ""}

## Overview
${project.content}

${
  project.contributors.length > 0
    ? `## Contributors
${project.contributors.map((c) => `- [${c.name}](${c.url ?? siteConfig.url})`).join("\n")}`
    : ""
}

- [All Projects](${siteConfig.url}/projects)
- [Contact Trojans PK](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 6. Events
  if (path === "/events") {
    const { upcoming, past } = await getEvents();
    const md = `# Events | ${siteConfig.name}

> Hackathons, workshops, DevDays, and tech meetups organized or attended by Trojans PK.

## Upcoming Events
${
  upcoming.length > 0
    ? upcoming
        .map(
          (e) => `### [${e.title}](${siteConfig.url}/events/${e.slug})
- **Type**: ${e.type}
- **Date**: ${formatDate(e.startsAt)}
- **Location**: ${e.location ?? "Online"}
- **Summary**: ${e.summary}`,
        )
        .join("\n\n")
    : "No upcoming events scheduled right now. Join our channels to stay updated."
}

## Past Events
${past
  .map(
    (e) => `### [${e.title}](${siteConfig.url}/events/${e.slug})
- **Type**: ${e.type}
- **Date**: ${formatDate(e.startsAt)}
- **Location**: ${e.location ?? "Pakistan"}
- **Summary**: ${e.summary}`,
  )
  .join("\n\n")}

- [Community Discussions](${siteConfig.url}/community)
- [Host an Event With Us](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 6b. Event detail: /events/:slug
  if (path.startsWith("/events/")) {
    const slug = path.replace("/events/", "");
    const event = await getEventBySlug(slug);
    if (!event) return renderNotFound(path);

    const md = `# ${event.title}

> ${event.summary}

- **Type**: ${event.type}
- **Date**: ${formatDate(event.startsAt)}
- **Location**: ${event.location ?? "Pakistan"}
${event.organizer ? `- **Organizer**: ${event.organizer}` : ""}
${event.registrationUrl ? `- **Registration**: ${event.registrationUrl}` : ""}

## Event Details
${event.content || event.summary}

- [All Events](${siteConfig.url}/events)
- [Contact Trojans PK](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 7. Team
  if (path === "/team") {
    const team = await getTeam();
    const md = `# Team | ${siteConfig.name}

> Meet the founder and core leadership guiding Pakistan's developer and open-source community.

${team
  .map(
    (m) => `## ${m.name} (${m.role})
${m.bio ?? "Core leadership team member at Trojans PK."}
${m.github ? `- **GitHub**: https://github.com/${m.github}` : ""}
${m.linkedin ? `- **LinkedIn**: ${m.linkedin}` : ""}
${m.website ? `- **Website**: ${m.website}` : ""}`,
  )
  .join("\n\n")}

- [About Trojans PK](${siteConfig.url}/about)
- [Contact the Team](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // 8. Blog
  if (path === "/blog") {
    const posts = await getPosts();
    const md = `# Blog | ${siteConfig.name}

> Engineering write-ups, tutorials, hackathon stories and announcements from the Trojans PK developer community in Pakistan.

${posts
  .map(
    (p) => `## [${p.title}](${siteConfig.url}/blog/${p.slug})
- **Author**: ${p.authorName}
- **Published**: ${formatDate(p.publishedAt)}
- **Category**: ${p.categorySlug}
- **Excerpt**: ${p.excerpt}`,
  )
  .join("\n\n")}

- [Subscribe via RSS](${siteConfig.url}/blog/rss.xml)
- [Back to Home](${siteConfig.url}/)
`;
    return markdownResponse(md);
  }

  // 8b. Blog post: /blog/:slug
  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "");
    const post = await getPostBySlug(slug);
    if (!post) return renderNotFound(path);

    const md = `# ${post.title}

> ${post.excerpt}

- **Author**: ${post.authorName}
- **Published**: ${formatDate(post.publishedAt)}
- **Category**: ${post.categorySlug}
${post.tags.length > 0 ? `- **Tags**: ${post.tags.join(", ")}` : ""}

${post.content}

---
- [All Blog Posts](${siteConfig.url}/blog)
- [About Trojans PK](${siteConfig.url}/about)
`;
    return markdownResponse(md);
  }

  // 9. Join
  if (path === "/join") {
    const invites = await getInviteLinks();
    const md = `# Join ${siteConfig.name}

> Apply to join Pakistan's developer and open-source community. Every application is reviewed manually by our core team.

## Who Can Join
${joinCopy.whoCanJoin.map((w) => `- ${w}`).join("\n")}

## What You Gain
${joinCopy.whatYouGain.map((g) => `- ${g}`).join("\n")}

## How It Works
${joinCopy.howItWorks.map((s) => `1. **${s.step}**: ${s.detail}`).join("\n")}

## Community Channels While Awaiting Review
${invites.map((i) => `- [${i.label}](${i.href}): ${i.description ?? ""}`).join("\n")}

- [Official Contact](${siteConfig.url}/contact)
- [Back to Homepage](${siteConfig.url}/)
`;
    return markdownResponse(md);
  }

  // 10. Privacy
  if (path === "/privacy") {
    const md = `# Privacy Policy | ${siteConfig.name}

> How Trojans PK handles information on this website and in membership applications.

## Summary
Trojans PK is a volunteer developer community. This website is a static site that does not collect or store personal information itself, nor use tracking or advertising cookies.

## Membership Applications
Membership applications collected through external forms are used exclusively by the leadership team to evaluate community membership and contact applicants. Information is never sold or shared with advertisers.

## Contact & Information Requests
To access, correct, or delete information submitted in a membership application, contact talha@trojanspk.com.

- [Back to Homepage](${siteConfig.url}/)
- [Terms of Service](${siteConfig.url}/terms)
`;
    return markdownResponse(md);
  }

  // 11. Terms
  if (path === "/terms") {
    const md = `# Terms of Service | ${siteConfig.name}

> Community and website terms for Trojans PK.

## Community Standards
Members agree to adhere to our core community guidelines: respect, inclusivity, generous knowledge sharing, and honest engineering craft.

## Intellectual Property
Open-source projects hosted or initiated by Trojans PK are licensed under their respective open-source licenses (e.g. MIT, Apache 2.0).

- [Privacy Policy](${siteConfig.url}/privacy)
- [Contact Trojans PK](${siteConfig.url}/contact)
`;
    return markdownResponse(md);
  }

  // Unknown route -> Agent-friendly 404
  return renderNotFound(path);
}
