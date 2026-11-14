/**
 * Drafts (published: false / draft: true) are visible only while running the
 * local dev server, so authors can preview them. Production builds
 * (`next build`) always exclude drafts.
 */
export const showDrafts = process.env.NODE_ENV === "development";

export const isVisible = (published: boolean) => published || showDrafts;

/**
 * Sample content (src/data/sample-*.ts) is shown everywhere, production
 * included. Set HIDE_SAMPLE_CONTENT=1 (e.g. in Vercel's environment variables)
 * to hide it once real content exists, or delete the sample files.
 */
export const showSamples = process.env.HIDE_SAMPLE_CONTENT !== "1";
