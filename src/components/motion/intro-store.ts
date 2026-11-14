"use client";

import { useSyncExternalStore } from "react";

/*
 * Tiny global store: "has the opening curtain finished (or been skipped)?"
 * Entrance animations above the fold wait for it, so the hero plays as the
 * curtain lifts instead of behind it. Once true it stays true for the session,
 * so client-side navigations animate immediately.
 */
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIntroDone() {
  return useSyncExternalStore(subscribe, () => done, () => false);
}
