---
# DRAFT reference article: visible only in `npm run dev` (draft: true), never in production.
# It shows every Markdown feature the blog supports. Open /blog/markdown-formatting-guide locally.
title: "Markdown formatting guide"
excerpt: "Every formatting option the Trojans PK blog supports, from headings and tables to highlighted code, callouts, images and footnotes."
category: tutorials
tags: ["markdown", "writing", "guide"]
author: "Trojans PK"
date: 2026-11-17
draft: true
featured: false
---

This article is a reference for authors. Each section shows a Markdown feature exactly as readers will see it. The first paragraph of an article is set slightly larger, as an introduction.

## Headings and structure

Use `##` for sections and `###` for subsections. Both appear in the **On this page** outline, and every heading gets a link you can share: hover a heading and click the `#`.

### Emphasis and inline elements

You can write **bold**, _italic_, ~~strikethrough~~ and `inline code`. Links look like [the Trojans PK homepage](/) or [an external site](https://nextjs.org). Bare URLs such as https://github.com become links automatically.

## Lists

- Plain bullet points
- With **formatting** inside
  - And nested items
- Kept short and scannable

1. Numbered steps
2. Run in order
3. Ideal for tutorials

A checklist works too:

- [x] Write the draft
- [x] Add a cover image
- [ ] Publish from the admin panel

## Callouts

> [!NOTE]
> Useful information readers should notice, even when skimming.

> [!TIP]
> A shortcut or best practice that makes something easier.

> [!IMPORTANT]
> Key information readers need to succeed.

> [!WARNING]
> Something that could cause problems if ignored.

> [!CAUTION]
> Risks or negative outcomes of an action.

## Quotes

> The best way to learn is to build something real, ship it, and listen to the people who use it.

## Code

Code blocks are highlighted and get a copy button. Name the language after the opening fence.

```ts
type Member = { name: string; skills: string[] };

export function greet(member: Member): string {
  const top = member.skills.slice(0, 2).join(" and ");
  return `Welcome, ${member.name}! Great to have your ${top} skills.`;
}
```

```python
def leaderboard(scores: dict[str, int]) -> list[tuple[str, int]]:
    """Return teams sorted by score, highest first."""
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)
```

```bash
npm install
npm run dev
```

## Tables

| Event type | Typical length | Best for |
| --- | --- | --- |
| Hackathon | 24–48 hours | Shipping a working prototype |
| Workshop | 2–3 hours | Learning a tool hands-on |
| Tech session | 1 hour | Deep dives and Q&A |

## Images

Add a caption in quotes after the image address. In the admin editor you can also paste or drag an image straight into the text.

![Members working at a hackathon](/samples/events/hackathon.jpg "Sample photo: a weekend hackathon in progress.")

## Footnotes

Footnotes keep side notes out of the way[^1] while still giving credit where it is due.[^2]

[^1]: They appear at the end of the article, with a link back.
[^2]: Use them for sources and asides.

---

That covers everything. Write naturally and let the formatting support the ideas.
