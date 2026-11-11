/**
 * Drafts (published: false / draft: true) are visible only while running the
 * local dev server, so authors can preview them. Production builds
 * (`next build`) always exclude drafts.
 */
export const showDrafts = process.env.NODE_ENV === "development";

export const isVisible = (published: boolean) => published || showDrafts;
