/**
 * Drafts (published: false / draft: true) are visible only while running the
 * local dev server, so authors can preview them. Production builds
 * (`next build`) always exclude drafts.
 */
export const showDrafts = process.env.NODE_ENV === "development";

export const isVisible = (published: boolean) => published || showDrafts;

/**
 * Sample content (src/data/sample-*.ts) is shown in development, on Vercel
 * preview deployments, and wherever SHOW_SAMPLE_CONTENT=1 is set (e.g. local
 * `next build` checks). It is never shown on the Vercel production deployment.
 */
export const showSamples =
  process.env.VERCEL_ENV !== "production" &&
  (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview" || process.env.SHOW_SAMPLE_CONTENT === "1");
