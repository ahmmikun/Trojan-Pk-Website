"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { THEME_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0a0a0b" : "#fafaf8");
}

/** Light/dark switch. The saved choice is applied before first paint by the inline script in layout.tsx. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Reading the DOM after mount avoids a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage can be blocked; the choice then lasts for this visit only */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === null ? "Toggle color theme" : theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "relative overflow-hidden", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme ?? "dark"}
          initial={{ y: 14, rotate: -50, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 50, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="inline-flex"
        >
          {theme === "light" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
