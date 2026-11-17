"use client";

/**
 * Inline script that runs before first paint (theme + opening curtain).
 *
 * The server renders it as a normal script, so the browser executes it from the HTML. When
 * React renders it again in the browser (hydration, or Next re-rendering the root layout for
 * a 404), it gets `type="text/plain"`: React never creates an executable <script> on the
 * client (it warns and would not run it anyway), and the code has already run once.
 * suppressHydrationWarning covers the intentional `type` difference.
 */
export function EarlyScript({ code }: { code: string }) {
  return <script suppressHydrationWarning type={typeof window === "undefined" ? undefined : "text/plain"} dangerouslySetInnerHTML={{ __html: code }} />;
}
