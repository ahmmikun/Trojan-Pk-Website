"use client";

import { useLayoutEffect } from "react";
import { THEME_KEY } from "@/lib/theme";

/**
 * The admin is always light. The root layout script handles full page loads; this covers
 * client-side navigation into /admin and restores the visitor's site theme on the way out.
 */
export function AdminTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    return () => {
      let light = false;
      try {
        light = localStorage.getItem(THEME_KEY) === "light";
      } catch {}
      if (!light && wasDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      }
    };
  }, []);
  return null;
}
