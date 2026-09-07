"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavItem, NavSection } from "@/types/nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthorization } from "@/lib/auth/use-authorization";

interface SidebarNavProps {
  items?: NavItem[];
  sections?: NavSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({
  items,
  sections,
  collapsed = false,
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { can, hasRole } = useAuthorization();

  const navSections: NavSection[] = React.useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (items && items.length > 0) return [{ items }];
    return [];
  }, [sections, items]);

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        aria-label="Main Navigation"
        className={cn("flex flex-col gap-4", className)}
      >
        {navSections.map((section, sIndex) => (
          <div key={section.title || sIndex} className="flex flex-col gap-1">
            {section.title && !collapsed && (
              <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wider text-nav-section-title uppercase select-none">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
                (item.href === "/dashboard" && pathname === "/");

              const isPermitted =
                (!item.requiredPermission || can(item.requiredPermission)) &&
                (!item.requiredRole || hasRole(item.requiredRole));

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={isPermitted ? item.href : "/dashboard?error=admin_required"}
                        onClick={isPermitted ? onNavigate : undefined}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl transition-all mx-auto relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          isActive
                            ? "bg-nav-active-bg text-nav-icon-active font-semibold shadow-xs border border-nav-active-border"
                            : "text-nav-icon hover:bg-nav-hover-bg hover:text-nav-icon-hover border border-transparent",
                          !isPermitted && "opacity-50 hover:opacity-75"
                        )}
                        aria-label={item.title}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-nav-icon-active" : "text-nav-icon")} />
                        {!isPermitted && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <Lock className="h-2 w-2" />
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      <span>{item.title}</span>
                      {!isPermitted ? (
                        <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-mono text-amber-500">
                          Admin Only
                        </span>
                      ) : item.badge ? (
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                          {item.badge}
                        </span>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={isPermitted ? item.href : "/dashboard?error=admin_required"}
                  onClick={isPermitted ? onNavigate : undefined}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isActive
                      ? "bg-nav-active-bg text-nav-text-active font-medium shadow-2xs border border-nav-active-border"
                      : "text-nav-text hover:bg-nav-hover-bg hover:text-nav-text-hover border border-transparent",
                    !isPermitted && "opacity-55 hover:opacity-80"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-nav-icon-active"
                        : "text-nav-icon group-hover:text-nav-icon-hover"
                    )}
                  />
                  <span className="truncate">{item.title}</span>

                  {!isPermitted ? (
                    <Badge
                      variant="outline"
                      className="ml-auto text-[9px] px-1.5 py-0 h-4 font-normal font-mono text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 gap-1"
                    >
                      <Lock className="h-2.5 w-2.5" />
                      <span>Admin</span>
                    </Badge>
                  ) : item.badge ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium font-mono border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

