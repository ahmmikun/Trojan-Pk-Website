#!/usr/bin/env node
/**
 * Audits the running production site (`next start`, or any deployment via
 * SITE_BASE_URL). Run after `npm run build`:
 *
 *   npm run check:site              internal checks (fast, offline)
 *   npm run check:site -- --external   also request every external link
 *   SITE_BASE_URL=https://preview.example.com npm run check:site
 *
 * Pages are discovered from /sitemap.xml and by following internal links.
 * Internal checks (failures exit with code 1):
 *   - every internal link, image and script resolves (HTTP < 400)
 *   - every #fragment points at an existing id on the target page
 *   - each page has one <h1>, a <title>, a meta description and a canonical URL
 *   - every <img> has an alt attribute
 *   - external links open safely (rel="noopener noreferrer" with target="_blank")
 *   - JSON-LD blocks are valid JSON
 *   - sitemap URLs exist and robots.txt references the sitemap
 *   - security headers (including a CSP) are sent, unknown URLs return 404
 */
import { startServer } from "./lib/server.mjs";

const checkExternal = process.argv.includes("--external");

const errors = [];
const warnings = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

const server = await startServer();
const BASE = server.base;

const htmlCache = new Map(); // path -> { status, html, headers }
async function load(urlPath) {
  const key = urlPath.split("#")[0];
  if (!htmlCache.has(key)) {
    const res = await fetch(BASE + key, { redirect: "manual" });
    const type = res.headers.get("content-type") ?? "";
    htmlCache.set(key, { status: res.status, headers: res.headers, html: type.includes("text/html") ? await res.text() : "" });
  }
  return htmlCache.get(key);
}
const existsCache = new Map();
/** True when the URL answers with a non-error status. */
async function exists(urlPath) {
  const key = urlPath.split("#")[0];
  if (!existsCache.has(key)) {
    const res = await fetch(BASE + key, { redirect: "follow" });
    await res.body?.cancel();
    existsCache.set(key, res.status < 400);
  }
  return existsCache.get(key);
}
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"))?.[2] ?? tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, "i"))?.[1];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const idCache = new Map();
async function idsOf(urlPath) {
  const key = urlPath.split("#")[0];
  if (!idCache.has(key)) {
    const { html } = await load(key);
    idCache.set(key, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(key);
}
const externalLinks = new Map(); // url -> pages
let internalChecked = 0;

// --- discover pages: sitemap + internal links ------------------------------
const sitemapRes = await fetch(BASE + "/sitemap.xml");
const sitemapXml = sitemapRes.ok ? await sitemapRes.text() : "";
const queue = ["/"];
for (const m of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) queue.push(new URL(decode(m[1])).pathname);
const seen = new Set();
const pages = [];
while (queue.length) {
  const page = queue.shift();
  if (seen.has(page)) continue;
  seen.add(page);
  const loaded = await load(page);
  if (loaded.status !== 200) {
    fail(page, `expected HTTP 200, got ${loaded.status}`);
    continue;
  }
  pages.push(page);
  for (const m of loaded.html.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(m[0], "href") && decode(attr(m[0], "href"));
    if (href && href.startsWith("/") && !href.startsWith("//")) {
      const q = href.split("#")[0].split("?")[0];
      if (q && !/\.[a-z0-9]+$/i.test(q) && !q.startsWith("/_next")) queue.push(q);
    }
  }
}

for (const page of pages) {
  const { html } = await load(page);
  const isNotFound = false;

  // --- SEO / structure -------------------------------------------------
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (!isNotFound && h1s !== 1) fail(page, `expected exactly one <h1>, found ${h1s}`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(page, "missing <title>");
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(page, "missing meta description");
  if (!isNotFound && !/<link rel="canonical" href="[^"]+"/.test(html)) fail(page, "missing canonical URL");
  if (!/<html[^>]*\slang="/.test(html)) fail(page, "missing <html lang>");

  // --- text encoding: UTF-8 read as Windows-1252 leaves tell-tale sequences ---
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  const mojibake = visibleText.match(/Â[©·®°±«»\u00a0]|Ã[\u0080-\u00bf]|â€[\u0080-\u00bf™œ“”˜]?|ï»¿/);
  if (mojibake) fail(page, `garbled text encoding ("${mojibake[0]}"); a source file was saved with the wrong encoding`);

  // --- JSON-LD ---------------------------------------------------------
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      if (!data["@context"] || !data["@type"]) fail(page, "JSON-LD is missing @context/@type");
    } catch {
      fail(page, "invalid JSON-LD");
    }
  }

  // --- images ----------------------------------------------------------
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(m[0])) fail(page, `<img> without alt: ${m[0].slice(0, 80)}`);
  }

  // --- links & assets --------------------------------------------------
  for (const m of html.matchAll(/<a\b[^>]*>/g)) {
    const tag = m[0];
    const href = attr(tag, "href") && decode(attr(tag, "href"));
    if (!href) continue;

    if (/^https?:\/\//i.test(href)) {
      externalLinks.set(href, (externalLinks.get(href) ?? new Set()).add(page));
      if (/\starget="_blank"/.test(tag) && !/rel="[^"]*noopener[^"]*"/.test(tag)) fail(page, `target=_blank without rel=noopener: ${href}`);
      continue;
    }
    if (/^(mailto:|tel:)/i.test(href)) continue;
    if (/^javascript:/i.test(href)) {
      fail(page, `javascript: link ${href}`);
      continue;
    }

    internalChecked++;
    if (href.startsWith("#")) {
      if (href.length > 1 && !(await idsOf(page)).has(href.slice(1))) fail(page, `broken in-page anchor ${href}`);
      continue;
    }
    if (!href.startsWith("/")) {
      warn(page, `relative link not checked: ${href}`);
      continue;
    }
    if (!(await exists(href))) {
      fail(page, `broken internal link ${href}`);
      continue;
    }
    const frag = href.split("#")[1];
    if (frag && !(await idsOf(href)).has(frag)) fail(page, `link ${href}: no element with id="${frag}" on the target page`);
  }

  for (const m of html.matchAll(/<(?:img|script|link|source)\b[^>]*>/g)) {
    for (const name of ["src", "href"]) {
      const v = attr(m[0], name) && decode(attr(m[0], name));
      if (!v) continue;
      // Sub-resources from other origins would be blocked by the CSP (images over https are allowed).
      if (/^(https?:)?\/\//i.test(v)) {
        const isImg = m[0].startsWith("<img");
        const isPlainLink = m[0].startsWith("<link") && !/rel="(stylesheet|preload|modulepreload)"/.test(m[0]);
        if (!isImg && !isPlainLink) fail(page, `external ${m[0].split(/[\s>]/)[0].slice(1)} ${v} would be blocked by the CSP (next.config.ts)`);
        continue;
      }
      if (!v.startsWith("/")) continue;
      if (/rel="canonical"|rel="alternate"/.test(m[0])) continue;
      internalChecked++;
      if (!(await exists(v))) fail(page, `missing asset ${v}`);
    }
  }
}

// --- sitemap & robots ----------------------------------------------------
if (!sitemapRes.ok) {
  fail("/sitemap.xml", `missing (HTTP ${sitemapRes.status})`);
} else {
  for (const m of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const u = new URL(decode(m[1]));
    if (!(await exists(u.pathname))) fail("/sitemap.xml", `lists a URL with no page: ${u.pathname}`);
  }
}
const robotsRes = await fetch(BASE + "/robots.txt");
const robotsTxt = robotsRes.ok ? await robotsRes.text() : "";
if (!/Sitemap:/i.test(robotsTxt)) fail("/robots.txt", "missing or does not reference the sitemap");

// --- security headers + 404 handling -------------------------------------
{
  const { headers } = await load("/");
  for (const h of ["content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "strict-transport-security"]) {
    if (!headers.get(h)) fail("/", `missing response header ${h}`);
  }
  if (headers.get("x-powered-by")) fail("/", "X-Powered-By header is exposed");
  const missing = await fetch(BASE + "/this-page-does-not-exist");
  await missing.body?.cancel();
  if (missing.status !== 404) fail("/this-page-does-not-exist", `expected 404, got ${missing.status}`);
}

// A localhost base URL means NEXT_PUBLIC_SITE_URL was not set for this build.
if (sitemapXml.includes("localhost")) {
  warn("/sitemap.xml", "URLs point at localhost. Set NEXT_PUBLIC_SITE_URL to your real domain before the production build.");
}
// --- external links (opt-in) ---------------------------------------------
// Social platforms commonly block automated requests; those are reported as
// "unverifiable" instead of failures.
const BOT_BLOCKING = /(^|\.)(instagram\.com|linkedin\.com|facebook\.com|x\.com|twitter\.com|tiktok\.com|whatsapp\.com|t\.me|discord\.gg|discord\.com)$/;
const externalResults = [];
if (checkExternal) {
  const urls = [...externalLinks.keys()].filter((u) => !/twitter\.com\/intent|linkedin\.com\/sharing|facebook\.com\/sharer|wa\.me\/\?text/.test(u));
  console.log(`Checking ${urls.length} external link(s)...`);
  for (const url of urls) {
    const host = new URL(url).hostname;
    let status = 0;
    let note = "";
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; TrojansPK-LinkCheck/1.0)" } });
      clearTimeout(timer);
      status = res.status;
    } catch (e) {
      note = e.name === "AbortError" ? "timeout" : (e.cause?.code ?? e.message);
    }
    const ok = status >= 200 && status < 400;
    const blocked = !ok && BOT_BLOCKING.test(host) && (status === 0 || [401, 403, 429, 999].includes(status));
    externalResults.push({ url, status, note, verdict: ok ? "ok" : blocked ? "unverifiable" : "broken", pages: [...externalLinks.get(url)] });
  }
}

// --- report --------------------------------------------------------------
console.log(`\nChecked ${pages.length} pages, ${internalChecked} internal link/asset references, ${externalLinks.size} unique external links.`);
if (checkExternal) {
  for (const r of externalResults) console.log(`  [${r.verdict.padEnd(12)}] ${String(r.status || "---").padEnd(3)} ${r.url}${r.note ? ` (${r.note})` : ""}`);
  for (const r of externalResults) if (r.verdict === "broken") fail(r.pages[0], `external link failed (${r.status || r.note}): ${r.url}`);
}
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n  ` + warnings.join("\n  "));
await server.stop();
if (errors.length) {
  console.log(`\nFAILED (${errors.length}):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("\nAll checks passed.");
