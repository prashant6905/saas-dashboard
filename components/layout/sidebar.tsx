"use client";

import * as React from "react";
import {
  Command,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAV_SECTIONS } from "@/lib/nav-config";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out shadow-soft",
        collapsed ? "w-[68px]" : "w-64",
        className
      )}
    >
      {/* Workspace Selector / Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {collapsed ? (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background font-bold shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 3v9M12 12l-6 9M12 12l6 9" />
            </svg>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-nav-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 3v9M12 12l-6 9M12 12l6 9" />
                  </svg>
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[13px] font-semibold text-foreground tracking-tight">
                    UrbanNest D2C
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground font-medium">
                    Commerce Analytics
                  </span>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-nav-icon" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.05em] font-semibold text-muted-foreground font-table-header">
                Organizations
              </DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 font-medium text-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground text-[10px]">
                  U
                </div>
                UrbanNest D2C (Live)
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-muted-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px]">
                  V
                </div>
                Vastraa Lifestyle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground">
                Workspace Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Desktop Collapse Toggle (if provided) */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            className={cn(
              "text-nav-icon hover:text-nav-icon-hover hover:bg-nav-hover-bg shrink-0 hidden lg:flex rounded-lg",
              collapsed && "mx-auto mt-1"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav
          sections={APP_NAV_SECTIONS}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>

      {/* Telemetry / Node Health Indicator */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar/50 dark:bg-card/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-foreground/85">Production Node</span>
            </div>
            <span className="font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
              Operational
            </span>
          </div>
        </div>
      )}

      {/* User / Profile Footer */}
      <div className="border-t border-sidebar-border p-2.5">
        <UserNav collapsed={collapsed} />
      </div>
    </aside>
  );
}
