"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { CommandPaletteProvider } from "@/components/command/command-palette-context";
import { CommandPalette } from "@/components/command/command-palette";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <CommandPaletteProvider>
      <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        {/* Ambient Dark-Mode Atmospheric Glow (Hidden in Light Mode) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block"
        >
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-indigo-500/12 blur-[128px]" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-sky-500/8 blur-[128px]" />
          <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-purple-500/8 blur-[128px]" />
        </div>

        {/* Desktop Sidebar (Fixed) */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            className="fixed inset-y-0 left-0 z-40"
          />
        </div>

        {/* Main Layout Area */}
        <div
          className={cn(
            "relative z-10 flex min-h-screen flex-col transition-all duration-300 ease-in-out",
            collapsed ? "lg:pl-[68px]" : "lg:pl-64"
          )}
        >
          {/* Top Navigation Bar */}
          <TopBar />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Accessible Command Palette Dialog */}
        <CommandPalette />
      </div>
    </CommandPaletteProvider>
  );
}
