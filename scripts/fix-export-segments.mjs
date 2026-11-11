#!/usr/bin/env node
/**
 * Post-build fix for a Next.js 16.4 static-export mismatch.
 *
 * With `output: "export"`, the client router requests each page's leaf
 * prefetch segment as a flat, dot-joined file:
 *     /about/__next.!KHNpdGUp.about.__PAGE__.txt
 * (see next/dist/shared/lib/segment-cache/segment-value-encoding.js,
 *  convertSegmentPathToStaticExportFilename), but the exporter writes it as
 * nested folders:
 *     /about/__next.!KHNpdGUp/about/__PAGE__.txt
 *
 * Every page then logs a 404 in the browser console and client navigation
 * falls back to a slower full-page payload. This script copies each nested
 * segment file to the flat name the client expects. It is idempotent and does
 * nothing once Next.js writes the flat files itself.
 */
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
if (!existsSync(OUT)) {
  console.error('[fix-export-segments] No ./out folder. Run "next build" first.');
  process.exit(1);
}

let copied = 0;
let alreadyPresent = 0;

/** Recursively collect files under `dir`. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// A nested segment tree starts at a directory named "__next.<something>" that
// sits next to that route's other __next.*.txt files.
function findSegmentRoots(dir) {
  const roots = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) roots.push(p);
    else if (name !== "_next") roots.push(...findSegmentRoots(p));
  }
  return roots;
}

for (const root of findSegmentRoots(OUT)) {
  const routeDir = path.dirname(root);
  for (const file of walk(root)) {
    if (!file.endsWith(".txt")) continue;
    // __next.!KHNpdGUp/about/__PAGE__.txt -> __next.!KHNpdGUp.about.__PAGE__.txt
    const relative = path.relative(routeDir, file).split(path.sep).join(".");
    const flat = path.join(routeDir, relative);
    if (existsSync(flat)) {
      alreadyPresent++;
      continue;
    }
    copyFileSync(file, flat);
    copied++;
  }
}

console.log(`[fix-export-segments] wrote ${copied} flat segment file(s)${alreadyPresent ? `, ${alreadyPresent} already present` : ""}.`);
