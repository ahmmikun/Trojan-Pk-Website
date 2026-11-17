import type { Partner } from "@/types/content";

/**
 * Organisations Trojans PK has collaborated with. Shown on the home page and
 * the About page; the section is hidden while this list is empty.
 *
 * Only list real, confirmed collaborations, and check each organisation's
 * brand guidelines before adding its logo. Leave `logo` null to show the name
 * as a typographic wordmark instead.
 *
 * TODO(content): add what you did together (`detail`), the `year`, a `url`,
 * and the other collaborators.
 */
export const partnersData: Partner[] = [
  {
    id: "google-developer-groups",
    name: "Google Developer Groups",
    short: "GDG",
    detail: null,
    year: null,
    url: "https://gdg.community.dev/",
    logo: null,
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    short: "AWS",
    detail: null,
    year: null,
    url: "https://aws.amazon.com/",
    logo: null,
  },
];
