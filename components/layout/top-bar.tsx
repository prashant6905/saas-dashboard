"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Search, Clock, ArrowLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { useCommandPalette } from "@/components/command/command-palette-context";

export function TopBar() {
  const pathname = usePathname();
  const { open } = useCommandPalette();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/orders/")) {
      const id = path.replace("/orders/", "");
      return `Orders / ${id}`;
    }
    if (path.startsWith("/products/")) {
      const id = path.replace("/products/", "");
      return `Products / ${id}`;
    }
    switch (path) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/analytics":
        return "Analytics";
      case "/orders":
        return "Orders";
      case "/products":
        return "Products";
      case "/customers":
        return "Customers";
      case "/settings":
        return "Settings";
      default:
        return path.replace("/", "").replace(/-/g, " ");
    }
  };

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-15 w-full items-center justify-between border-b border-border/70 bg-card/70 px-4 sm:px-6 backdrop-blur-xl transition-colors">
      {/* Left: Mobile Drawer Trigger & Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        <MobileNav />
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium"
        >
          {/* Browser-style back navigation icon button */}
          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 dark:border-slate-700/80 bg-background text-slate-700 dark:text-slate-300 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer mr-0.5"
            aria-label="Navigate back"
            title="Back"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
          </button>
          <span className="text-slate-600 dark:text-slate-400 hover:text-foreground transition-colors hidden sm:inline">
            UrbanNest D2C
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0 hidden sm:inline" />
          <span className="text-foreground font-semibold tracking-tight truncate max-w-[180px] sm:max-w-none">
            {title}
          </span>
        </nav>
      </div>

      {/* Right: Global Search Placeholder, Schedule pill button, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Command Palette Search Trigger */}
        <div className="relative hidden md:flex items-center">
          <button
            type="button"
            onClick={open}
            className="group flex h-8.5 items-center gap-2 rounded-xl border border-border/80 dark:border-slate-700/80 bg-background px-3 text-xs text-slate-700 dark:text-slate-300 transition-all duration-150 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 w-48 lg:w-60 cursor-pointer shadow-2xs"
            aria-label="Open Command Palette (Ctrl+K or Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-400 transition-colors group-hover:text-foreground" />
            <span className="truncate text-slate-700 dark:text-slate-300 group-hover:text-foreground font-medium">Search commands...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded-md border border-border/70 bg-neutral-100 dark:bg-slate-800/80 px-1.5 font-mono text-[9px] font-semibold text-slate-600 dark:text-slate-400">
              <span>Ctrl</span>+<span>K</span>
            </kbd>
          </button>
        </div>

        {/* Schedule / Action Button */}
        <button
          type="button"
          onClick={open}
          className="group hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border/80 dark:border-slate-700/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 transition-colors group-hover:text-foreground" />
          <span>Schedule</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile trigger on topbar */}
        <div className="h-5 w-[1px] bg-border/60 hidden sm:block" />
        <div className="w-auto">
          <UserNav collapsed={true} />
        </div>
      </div>
    </header>
  );
}
