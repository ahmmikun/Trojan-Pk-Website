#!/usr/bin/env node
/* global axe */ // injected into the page by addScriptTag
/**
 * Real-browser tests against the production server (`next start`).`r`n *`r`n *   npm run build && npm run test:browser`r`n *   SITE_BASE_URL=https://preview.example.com npm run test:browser   test a deployment
 *   npm run test:browser -- --shots      also save full-page screenshots to .test-output/
 *
 * Needs Chrome, Edge or Chromium installed (set CHROME_PATH to override).
 * Covers: console errors, failed requests, horizontal overflow at three widths,
 * an axe-core accessibility audit, and key interactions.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { startServer } from "./lib/server.mjs";

const SHOTS = process.argv.includes("--shots") ? path.resolve(".test-output") : null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge/Chromium found. Set CHROME_PATH.");
  process.exit(1);
}

// ---- production server (next start, or SITE_BASE_URL) --------------------
const server = await startServer();
const BASE = server.base;

// ---- test bookkeeping -----------------------------------------------------
const failures = [];
const notes = [];
let passed = 0;
function check(name, ok, detail = "") {
  if (ok) passed++;
  else failures.push(`${name}${detail ? ` -> ${detail}` : ""}`);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `  (${detail})` : ""}`);
}

const routes = ["/", "/about", "/community", "/projects", "/projects/bolkhata", "/events", "/events/alibaba-cloud-ai-hackathon-pakistan-2026-national-finals", "/team", "/blog", "/join", "/privacy", "/terms"];
const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];
/** Run an interaction group; a thrown error becomes a recorded failure instead of aborting the suite. */
async function guard(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(` (crashed)`, false, String(e.message ?? e).split("\n")[0]);
  }
}
const slug = (r) => (r === "/" ? "home" : r.slice(1).replace(/\//g, "_")).slice(0, 40);

const browser = await chromium.launch({ executablePath, headless: true });
// Every context skips the opening curtain (as on a repeat visit) unless it passes { intro: true }.
{
  const rawNewContext = browser.newContext.bind(browser);
  browser.newContext = async ({ intro = false, ...options } = {}) => {
    const context = await rawNewContext(options);
    if (!intro) await context.addInitScript((key) => { try { sessionStorage.setItem(key, "1"); } catch {} }, "trojans-intro");
    return context;
  };
}
const axeSource = readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

try {
  // ======== 1. page matrix: console, requests, overflow, screenshots =========
  console.log("\n== Pages x viewports ==");
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const route of routes) {
      const page = await context.newPage();
      const problems = [];
      page.on("console", (m) => {
        if (m.type() === "error") problems.push(`console.error: ${m.text().slice(0, 200)}`);
      });
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
      page.on("requestfailed", (r) => {
        const errorText = r.failure()?.errorText ?? "";
        // Ignore benign aborts from in-flight prefetch/navigation teardown.
        if (/aborted|canceled/i.test(errorText)) return;
        problems.push(`request failed: ${r.url()}${errorText ? ` (${errorText})` : ""}`);
      });
      page.on("response", (r) => {
        if (r.status() >= 400 && r.url() !== `${BASE}${route}`) problems.push(`HTTP ${r.status()}: ${r.url()}`);
      });
      const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
      const expected = 200;
      if (res.status() !== expected) problems.push(`status ${res.status()}`);
      await page.waitForTimeout(900); // let entrance animations settle

      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        const wide = [...document.querySelectorAll("body *")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > de.clientWidth + 1 && getComputedStyle(el).position !== "fixed";
        });
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits: wide.slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 50)}`) };
      });
      if (overflow.scrollWidth > overflow.clientWidth + 1) problems.push(`horizontal overflow ${overflow.scrollWidth}>${overflow.clientWidth} (${overflow.culprits.join(", ")})`);

      check(`${vp.name.padEnd(7)} ${route}`, problems.length === 0, problems.join("; "));
      if (SHOTS) {
        // Play the scroll-triggered reveals before capturing.
        await page.evaluate(async () => {
          for (let y = 0; y <= document.body.scrollHeight; y += 400) {
            window.scrollTo({ top: y, behavior: "instant" });
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(SHOTS, `${vp.name}_${slug(route)}.png`), fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }

  // ======== 2. accessibility (axe-core) ======================================
  console.log("\n== Accessibility (axe-core, WCAG 2.0/2.1 A + AA) ==");
  for (const [vp, theme] of [viewports[0], viewports[2]].flatMap((v) => ["dark", "light"].map((t) => [v, t]))) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      // Scroll through the page so scroll-triggered reveals have played, then measure contrast on final colors.
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 500) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      if (theme === "light") await page.evaluate(() => document.documentElement.classList.remove("dark"));
      await page.waitForTimeout(1500);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, sample: v.nodes.slice(0, 2).map((n) => `${n.target.join(" ")} :: ${(n.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 160)}`) }))),
      );
      check(`a11y ${theme.padEnd(5)} ${vp.name.padEnd(7)} ${route}`, result.length === 0, result.map((v) => `${v.id}[${v.impact}] x${v.count}: ${v.sample.join(" | ")}`).join(" ;; "));
      await page.close();
    }
    await context.close();
  }

  // ======== 3. interactions ==================================================
  console.log("\n== Interactions ==");

  // 3a. mobile menu
  await guard("3a. mobile menu", async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const desktopNavHidden = !(await page.locator('nav[aria-label="Main"]').isVisible());
    check("mobile: desktop nav hidden", desktopNavHidden);
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
    check("mobile: menu opens as a dialog", await dialog.isVisible());
    const labels = (await dialog.locator("nav a").allInnerTexts()).map((x) => x.replace(/\s*\d+\s*$/, "").trim());
    check("mobile: menu lists all 7 links", labels.length === 7 && ["Home", "About", "Community", "Projects", "Events", "Team", "Blog"].every((l) => labels.some((x) => x.trim() === l)), labels.join(","));
    check("mobile: menu has Join CTA", (await dialog.getByRole("link", { name: "Join Community" }).count()) === 1);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
    check("mobile: Escape closes menu", !(await dialog.isVisible().catch(() => false)));
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Team" }).click();
    await page.waitForURL("**/team", { timeout: 5000 }).catch(() => {});
    check("mobile: tapping Team navigates to /team", page.url().endsWith("/team"), page.url());
    await page.waitForTimeout(500);
    check("mobile: menu closes after navigating", !(await page.getByRole("dialog").isVisible().catch(() => false)));
    await context.close();
  });

  // 3b. desktop nav + keyboard
  await guard("3b. desktop nav + keyboard", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/about", { waitUntil: "networkidle" });
    const current = (await page.locator('nav[aria-label="Main"] a[aria-current="page"]').allInnerTexts()).map((x) => x.replace(/\s*\d+\s*$/, "").trim());
    check("desktop: active nav item is About", current.length === 1 && current[0].trim() === "About", current.join(","));
    check("desktop: navbar is fixed over the page", (await page.evaluate(() => getComputedStyle(document.querySelector("header")).position)) === "fixed");

    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), visible: (() => { const r = document.activeElement?.getBoundingClientRect(); return !!r && r.width > 1 && r.height > 1 && r.top >= 0; })() }));
    check('keyboard: first Tab stop is "Skip to content" and visible', first.text === "Skip to content" && first.visible, JSON.stringify(first));
    await page.keyboard.press("Enter");
    check("keyboard: skip link jumps to #main", page.url().endsWith("#main"), page.url());
    // focus ring visible on a link
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { outline: s.outlineStyle, width: s.outlineWidth }; });
    check("keyboard: focused element shows an outline", ring.outline !== "none" && parseFloat(ring.width) >= 1, JSON.stringify(ring));
    await context.close();
  });

  // 3c. projects search + filters
  await guard("3c. projects search + filters", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
    const status = () => page.getByRole("status").filter({ hasText: /project/ }).first().innerText();
    check("projects: initial count is 1 project", (await status()).trim() === "1 project", await status());
    const search = page.getByRole("searchbox", { name: "Search projects" });
    await search.fill("bol");
    check("projects: search 'bol' finds BolKhata", (await status()).trim() === "1 project");
    await search.fill("zzzz");
    check("projects: search with no match shows empty state", (await page.getByText("No projects match your filters").count()) === 1);
    await page.getByRole("button", { name: "Clear filters" }).click();
    check("projects: Clear filters restores results", (await status()).trim() === "1 project" && (await search.inputValue()) === "");
    await page.getByRole("button", { name: /^Web Development/ }).click();
    check("projects: category filter 'Web Development' -> 0 projects", (await status()).trim() === "0 projects");
    await page.getByRole("button", { name: /^AI\/ML/ }).click();
    check("projects: category filter 'AI/ML' -> 1 project", (await status()).trim() === "1 project");
    check("projects: active filter exposes aria-pressed", (await page.getByRole("button", { name: /^AI\/ML/ }).getAttribute("aria-pressed")) === "true");
    check("projects: technology filter hidden while no technologies exist", (await page.getByRole("group", { name: "Filter by technology" }).count()) === 0);
    await context.close();
  });

  // 3d. copy-to-clipboard + external link safety
  await guard("3d. copy-to-clipboard + external link safety", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await context.newPage();
    await page.goto(BASE + "/community", { waitUntil: "networkidle" });
    const buttons = page.getByRole("button", { name: /^Copy link for / });
    check("community: 3 copy-link buttons (WhatsApp, Discord, Telegram)", (await buttons.count()) === 3, String(await buttons.count()));
    await page.getByRole("button", { name: /for WhatsApp Community$/ }).click();
    await page.waitForTimeout(300);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    check("community: copy puts the WhatsApp invite URL on the clipboard", clip === "https://chat.whatsapp.com/HosYEWJuqnvEn21xO0tMqU", clip);
    check('community: button label changes to "Copied"', (await page.getByRole("button", { name: /for WhatsApp Community$/ }).innerText()).includes("Copied"));
    check("community: live region announces the copy", (await page.getByText("WhatsApp Community link copied to clipboard").count()) === 1);
    const ext = await page.evaluate(() => [...document.querySelectorAll('a[href^="http"]')].filter((a) => a.target === "_blank" && !/noopener/.test(a.rel)).length);
    check("community: every _blank link has rel=noopener", ext === 0, String(ext));
    check("community: FAQ accordion expands", await (async () => {
      const q = page.getByRole("button", { name: "Who can join Trojans PK?" });
      await q.click();
      await page.waitForTimeout(400);
      return (await q.getAttribute("aria-expanded")) === "true";
    })());
    await context.close();
  });

  // 3e. reduced motion: content must be visible without animation
  await guard("3e0. no-JS: content visible without JavaScript", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(1200); // CSS entrance animations finish without JS
    const h1 = await page.evaluate(() => getComputedStyle(document.querySelector("h1").parentElement).opacity);
    check("no-JS: hero heading is visible", h1 === "1", h1);
    const target = page.getByText("Community, not company");
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const op = await target.evaluate((el) => getComputedStyle(el.closest(".reveal-in-view") ?? el).opacity);
    check("no-JS: scroll-revealed mission text is visible once in view", op === "1", op);
    const hiddenInHtml = await page.evaluate(() => [...document.querySelectorAll("[data-fm]")].filter((el) => getComputedStyle(el).opacity !== "1" && !el.closest('[aria-hidden="true"]')).length);
    check("no-JS: no animated content stays hidden", hiddenInHtml === 0, String(hiddenInHtml));
    await context.close();
  });

  // 3e. reduced motion: content must be visible without animation
  await guard("3e. reduced motion: content must be visible without animation", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const op = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).opacity);
    check("reduced motion: hero heading is immediately fully visible", op === "1", op);
    check("reduced motion: Lenis smooth scrolling is not started", await page.evaluate(() => !document.documentElement.classList.contains("lenis")));
    await context.close();
  });

  // 3f. content truthfulness + join page without backend
  await guard("3f. content truthfulness + join page without backend", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/join", { waitUntil: "networkidle" });
    check("join: no <form> and no Apply button while applicationFormUrl is null", (await page.locator("form").count()) === 0 && (await page.getByRole("link", { name: /Apply now/ }).count()) === 0);
    check("join: shows the three community invite cards", (await page.getByRole("link", { name: /Join now/ }).count()) === 3);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const text = await page.evaluate(() => document.body.innerText);
    check("home: no testimonials or statistics sections (nothing invented)", !/What members say|Community impact/.test(text));
    check("home: achievement shows BolKhata + National Finalist + 24 October 2026", /BolKhata/.test(text) && /National Finalist/.test(text) && /24 October 2026/.test(text));
    await page.goto(BASE + "/does-not-exist", { waitUntil: "networkidle" });
    check("404 page renders custom page with link home", (await page.getByRole("heading", { name: "Page not found" }).count()) === 1 && (await page.getByRole("link", { name: "Back to home" }).count()) === 1);
    await context.close();
  });
  // 3g. image optimization
  await guard("3g. image optimization", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const res = await page.request.get(`${BASE}/_next/image?url=%2Fbrand%2Fmark.png&w=48&q=75`, { headers: { accept: "image/avif,image/webp,*/*" } });
    const type = res.headers()["content-type"] ?? "";
    const size = (await res.body()).length;
    check("images: optimizer serves AVIF/WebP", res.ok() && /image\/(avif|webp)/.test(type), `${res.status()} ${type}`);
    check("images: optimized logo is far smaller than the 155 KB original", size < 10_000, `${size} bytes`);
    const unlisted = await page.request.get(`${BASE}/_next/image?url=%2Fbrand%2Fmark.png&w=48&q=50`);
    check("images: qualities outside the allowlist are rejected", unlisted.status() === 400, String(unlisted.status()));
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const raw = await page.evaluate(() => [...document.images].filter((i) => /^\/brand\//.test(new URL(i.currentSrc || i.src).pathname)).length);
    check("images: no raw /public image is requested directly", raw === 0, String(raw));
    await context.close();
  });
  // 3h. theme toggle + Lenis smooth scrolling
  await guard("3h. theme toggle + smooth scrolling", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    check("theme: dark is the default", await isDark());
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    check("theme: toggle switches to light", !(await isDark()));
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check("theme: light background is light", bg === "rgb(250, 250, 248)", bg);
    await page.reload({ waitUntil: "networkidle" });
    check("theme: light choice persists after reload (no flash)", !(await isDark()));
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    check("theme: toggle switches back to dark", await isDark());
    check("lenis: smooth scrolling is active", await page.evaluate(() => document.documentElement.classList.contains("lenis")));
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(1200);
    const y = await page.evaluate(() => window.scrollY);
    check("lenis: mouse wheel scrolls the page", y > 200, String(y));
    await context.close();
  });
  // 3i. parallax images
  await guard("3i. parallax images", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/events", { waitUntil: "networkidle" });
    const layers = page.locator("article img").first().locator("xpath=..");
    if ((await layers.count()) === 0) {
      notes.push("parallax: no event images on /events (sample content off), check skipped");
    } else {
      await layers.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const before = await layers.evaluate((el) => getComputedStyle(el).transform);
      await page.mouse.move(640, 400);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(1200);
      const after = await layers.evaluate((el) => getComputedStyle(el).transform);
      check("parallax: image layer moves while scrolling", before !== after, `${before} -> ${after}`);
      const covered = await layers.evaluate((el) => {
        const frame = el.parentElement.getBoundingClientRect();
        const img = el.getBoundingClientRect();
        return img.top <= frame.top + 0.5 && img.bottom >= frame.bottom - 0.5;
      });
      check("parallax: image always covers its frame (no gaps)", covered);
    }
    await context.close();
  });
  // 3j. opening curtain
  await guard("3j. opening curtain", async () => {
    const context = await browser.newContext({ intro: true, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const curtain = page.locator("[data-intro]");
    check("curtain: covers the page on the first visit", await curtain.isVisible());
    const heroBefore = await page.evaluate(() => getComputedStyle(document.querySelector("h1 [data-fm]")).transform);
    await page.waitForTimeout(1200);
    const heroDuring = await page.evaluate(() => getComputedStyle(document.querySelector("h1 [data-fm]")).transform);
    check("curtain: hero animation waits while the curtain is down", heroBefore === heroDuring, `${heroBefore} -> ${heroDuring}`);
    await curtain.waitFor({ state: "detached", timeout: 6000 });
    await page.waitForTimeout(1500);
    const op = await page.evaluate(() => getComputedStyle(document.querySelector("h1 [data-fm]")).transform);
    check("curtain: removed after lifting, and the hero has played", op === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(op), op);
    await page.reload({ waitUntil: "domcontentloaded" });
    check("curtain: not shown again in the same session", !(await page.locator("[data-intro]").isVisible().catch(() => false)));
    await context.close();
  });
} finally {
  await browser.close();
  await server.stop();
}

console.log(`\n${passed} passed, ${failures.length} failed.`);
if (notes.length) console.log(notes.join("\n"));
if (failures.length) {
  console.log("\nFAILURES:\n - " + failures.join("\n - "));
  process.exit(1);
}
