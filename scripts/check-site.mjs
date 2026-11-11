#!/usr/bin/env node
/**
 * Audits the static export in ./out. Run after `npm run build`:
 *
 *   npm run check:site              internal checks (fast, offline)
 *   npm run check:site -- --external   also request every external link
 *
 * Internal checks (failures exit with code 1):
 *   - every internal link, image and script resolves to a file in ./out
 *   - every #fragment points at an existing id on the target page
 *   - each page has one <h1>, a <title>, a meta description and a canonical URL
 *   - every <img> has an alt attribute
 *   - external links open safely (rel="noopener noreferrer" with target="_blank")
 *   - JSON-LD blocks are valid JSON
 *   - sitemap URLs exist and robots.txt references the sitemap
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const checkExternal = process.argv.includes("--external");

if (!existsSync(OUT)) {
  console.error('No ./out folder. Run "npm run build" first.');
  process.exit(1);
}

const errors = [];
const warnings = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT);
const htmlFiles = files.filter((f) => f.endsWith(".html") && !f.includes(`${path.sep}_next${path.sep}`) && !f.includes("__next"));
const rel = (f) => "/" + path.relative(OUT, f).split(path.sep).join("/");

/** Map a URL path to a file in ./out, mirroring how static hosts resolve clean URLs. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  const candidates = [clean, `${clean}.html`, path.posix.join(clean, "index.html")];
  for (const c of candidates) {
    const f = path.join(OUT, c);
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"))?.[2] ?? tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, "i"))?.[1];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, "utf8");
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const externalLinks = new Map(); // url -> pages
let internalChecked = 0;

for (const file of htmlFiles) {
  const page = rel(file);
  const html = readFileSync(file, "utf8");
  const isNotFound = /404\.html$|_not-found/.test(page);

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
      if (href.length > 1 && !idsOf(file).has(href.slice(1))) fail(page, `broken in-page anchor ${href}`);
      continue;
    }
    if (!href.startsWith("/")) {
      warn(page, `relative link not checked: ${href}`);
      continue;
    }
    const target = resolveFile(href);
    if (!target) {
      fail(page, `broken internal link ${href}`);
      continue;
    }
    const frag = href.split("#")[1];
    if (frag && target.endsWith(".html") && !idsOf(target).has(frag)) fail(page, `link ${href}: no element with id="${frag}" on the target page`);
  }

  for (const m of html.matchAll(/<(?:img|script|link|source)\b[^>]*>/g)) {
    for (const name of ["src", "href"]) {
      const v = attr(m[0], name) && decode(attr(m[0], name));
      if (!v) continue;
      // Sub-resources from other origins would be blocked by the CSP (images over https are allowed).
      if (/^(https?:)?\/\//i.test(v)) {
        const isImg = m[0].startsWith("<img");
        const isPlainLink = m[0].startsWith("<link") && !/rel="(stylesheet|preload|modulepreload)"/.test(m[0]);
        if (!isImg && !isPlainLink) fail(page, `external ${m[0].split(/[\s>]/)[0].slice(1)} ${v} would be blocked by the CSP (public/_headers)`);
        continue;
      }
      if (!v.startsWith("/")) continue;
      if (/rel="canonical"|rel="alternate"/.test(m[0])) continue;
      internalChecked++;
      if (!resolveFile(v)) fail(page, `missing asset ${v}`);
    }
  }
}

// --- sitemap & robots ----------------------------------------------------
const sitemapFile = path.join(OUT, "sitemap.xml");
if (!existsSync(sitemapFile)) {
  fail("/sitemap.xml", "missing");
} else {
  const xml = readFileSync(sitemapFile, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const u = new URL(decode(m[1]));
    if (!resolveFile(u.pathname)) fail("/sitemap.xml", `lists a URL with no page: ${u.pathname}`);
  }
}
const robotsFile = path.join(OUT, "robots.txt");
if (!existsSync(robotsFile) || !/Sitemap:/i.test(readFileSync(robotsFile, "utf8"))) fail("/robots.txt", "missing or does not reference the sitemap");

// --- security headers ----------------------------------------------------
// The same policy must ship in _headers (Netlify/Cloudflare) and vercel.json (Vercel).
{
  const headersFile = path.join(OUT, "_headers");
  const cspFromHeaders = existsSync(headersFile) ? readFileSync(headersFile, "utf8").match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1]?.trim() : null;
  if (!cspFromHeaders) fail("/_headers", "missing from the export or has no Content-Security-Policy");
  let cspFromVercel = null;
  try {
    const v = JSON.parse(readFileSync("vercel.json", "utf8"));
    cspFromVercel = v.headers?.flatMap((h) => h.headers).find((h) => h.key === "Content-Security-Policy")?.value ?? null;
  } catch {
    /* handled below */
  }
  if (!cspFromVercel) fail("vercel.json", "missing or has no Content-Security-Policy");
  if (cspFromHeaders && cspFromVercel && cspFromHeaders !== cspFromVercel) fail("vercel.json", "Content-Security-Policy differs from public/_headers; keep them identical");
}

// A localhost base URL means NEXT_PUBLIC_SITE_URL was not set for this build.
if (existsSync(sitemapFile) && readFileSync(sitemapFile, "utf8").includes("localhost")) {
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
console.log(`\nChecked ${htmlFiles.length} pages, ${internalChecked} internal link/asset references, ${externalLinks.size} unique external links.`);
if (checkExternal) {
  for (const r of externalResults) console.log(`  [${r.verdict.padEnd(12)}] ${String(r.status || "---").padEnd(3)} ${r.url}${r.note ? ` (${r.note})` : ""}`);
  for (const r of externalResults) if (r.verdict === "broken") fail(r.pages[0], `external link failed (${r.status || r.note}): ${r.url}`);
}
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n  ` + warnings.join("\n  "));
if (errors.length) {
  console.log(`\nFAILED (${errors.length}):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("\nAll checks passed.");
