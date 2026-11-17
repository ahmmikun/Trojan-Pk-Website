import { readFileSync } from "node:fs";
for (const n of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(`.test-output/lh_${n}.json`, "utf8")); const a = j.audits; const s = (k) => Math.round((j.categories[k]?.score ?? 0) * 100);
  console.log(`${n.padEnd(26)} url=${j.finalDisplayedUrl.replace("http://127.0.0.1:3311", "")} perf ${s("performance")} a11y ${s("accessibility")} bp ${s("best-practices")} | FCP ${a["first-contentful-paint"].displayValue} LCP ${a["largest-contentful-paint"].displayValue} TBT ${a["total-blocking-time"].displayValue} CLS ${a["cumulative-layout-shift"].displayValue} TTFB ${a["server-response-time"].displayValue}`);
  const bad = Object.entries(a).filter(([, v]) => v.score !== null && v.score < 0.9 && ["binary", "numeric", "metricSavings"].includes(v.scoreDisplayMode)).map(([k, v]) => `${k}${v.displayValue ? " (" + v.displayValue + ")" : ""}`);
  console.log("   below 0.9:", bad.join(" | ") || "none");
}
