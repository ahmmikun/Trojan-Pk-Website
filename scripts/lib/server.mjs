import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

/**
 * Returns the base URL of the production server.
 *   - SITE_BASE_URL set: use it (e.g. a Vercel preview URL), nothing is started.
 *   - otherwise: start `next start` on a free port from the existing ./.next build.
 */
export async function startServer() {
  if (process.env.SITE_BASE_URL) {
    return { base: process.env.SITE_BASE_URL.replace(/\/$/, ""), stop: async () => {} };
  }
  if (!existsSync(path.resolve(".next", "BUILD_ID"))) {
    console.error('No production build in ./.next. Run "npm run build" first.');
    process.exit(1);
  }
  const port = await freePort();
  const nextBin = path.resolve("node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const base = `http://127.0.0.1:${port}`;

  const deadline = Date.now() + 60_000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`next start exited early:\n${log}`);
    try {
      const res = await fetch(base + "/robots.txt");
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      child.kill();
      throw new Error(`next start did not become ready in 60s:\n${log}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return {
    base,
    stop: async () => {
      child.kill();
    },
  };
}

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}
