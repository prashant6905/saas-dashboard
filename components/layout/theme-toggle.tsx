"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-slate-300/80 bg-neutral-200/70 p-0.5 opacity-60 dark:border-slate-700/80 dark:bg-slate-800/80"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs dark:bg-slate-900">
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        </span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      className={`group relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 select-none ${
        isDark
          ? "border-slate-700/90 bg-slate-900 hover:border-slate-600 focus-visible:ring-offset-slate-950"
          : "border-slate-300/90 bg-slate-200/90 hover:border-slate-400 focus-visible:ring-offset-white"
      }`}
    >
      {/* Track background subtle hint icons */}
      <span
        className={`absolute left-1.5 flex h-4 w-4 items-center justify-center transition-opacity duration-200 ${
          isDark ? "text-slate-500 opacity-40 group-hover:opacity-70" : "text-amber-600/70 opacity-0"
        }`}
      >
        <Sun className="h-3 w-3" />
      </span>
      <span
        className={`absolute right-1.5 flex h-4 w-4 items-center justify-center transition-opacity duration-200 ${
          isDark ? "text-indigo-400/70 opacity-0" : "text-slate-500 opacity-40 group-hover:opacity-70"
        }`}
      >
        <Moon className="h-3 w-3" />
      </span>

      {/* Sliding switch knob */}
      <span
        className={`pointer-events-none relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-xs transition-transform duration-300 ease-in-out ${
          isDark
            ? "translate-x-6 bg-slate-800 text-indigo-300 border border-slate-700/80 shadow-slate-950/60"
            : "translate-x-0 bg-white text-amber-500 border border-slate-200/80 shadow-slate-300/50"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
        )}
      </span>
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}
