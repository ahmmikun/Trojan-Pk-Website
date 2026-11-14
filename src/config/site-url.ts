/**
 * Public base URL used for canonical links, the sitemap, robots.txt, Open Graph
 * and structured data. Resolved once at build time.
 *
 * Order: NEXT_PUBLIC_SITE_URL (set this for your real domain), then the URL
 * the hosting platform provides automatically, then localhost for local work.
 * A production build on a known host with no usable URL fails loudly rather
 * than publishing localhost URLs to search engines.
 */
function normalize(raw: string): string {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol); // throws on garbage, which surfaces config mistakes at build time
  return url.origin + url.pathname.replace(/\/+$/, "");
}

function resolveSiteUrl(): string {
  const env = process.env;
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL, // Vercel
    env.CONTEXT === "production" ? env.URL : env.DEPLOY_PRIME_URL, // Netlify
    env.CF_PAGES_URL, // Cloudflare Pages
  ];
  const found = candidates.find((v) => v && v.trim());
  if (found) return normalize(found.trim());

  const onCiOrHost = Boolean(env.CI || env.VERCEL || env.NETLIFY || env.CF_PAGES);
  if (onCiOrHost && env.NODE_ENV === "production" && !env.ALLOW_LOCALHOST_SITE_URL) {
    throw new Error(
      "[site-url] No public site URL. Set NEXT_PUBLIC_SITE_URL (e.g. https://trojans.pk) in your host's environment variables. " +
        "To build anyway (e.g. CI checks), set ALLOW_LOCALHOST_SITE_URL=1.",
    );
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
