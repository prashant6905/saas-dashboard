"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  LogOut,
  Settings,
  Shield,
  User,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/lib/auth/auth-context";

interface UserNavProps {
  collapsed?: boolean;
}

export function UserNav({ collapsed = false }: UserNavProps) {
  const { user, signOut, switchRole, isAdmin, isViewer } = useAuth();

  const displayName = user?.name || "Aarav Sharma";
  const displayEmail = user?.email || "admin@commandcenter.io";
  const displayRole = user?.role || "ADMIN";

  const initials = React.useMemo(() => {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }, [displayName]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-all hover:bg-nav-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          aria-label="User account menu"
        >
          <div className="relative">
            <Avatar className="h-7 w-7 border border-border/80 dark:border-slate-700/80">
              <AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary dark:bg-primary/25 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-sidebar ${
                isAdmin ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </div>

          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden text-left">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold text-foreground tracking-tight">
                  {displayName}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    VIEWER
                  </span>
                )}
              </div>
              <span className="truncate text-[10px] text-muted-foreground font-mono">
                {displayEmail}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        align={collapsed ? "center" : "end"}
        side={collapsed ? "right" : "top"}
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">{displayName}</p>
              {isAdmin ? (
                <span className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  VIEWER
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">{displayEmail}</p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <Shield className="h-3 w-3" />
                RBAC Active ({displayRole} Role)
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Demo Quick Role Switcher for instant testing */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider py-1">
            Simulate RBAC Role
          </DropdownMenuLabel>
          {isAdmin ? (
            <DropdownMenuItem
              className="gap-2 text-xs cursor-pointer text-amber-600 dark:text-amber-400"
              onClick={() => switchRole("VIEWER")}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Switch to VIEWER Role</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="gap-2 text-xs cursor-pointer text-emerald-600 dark:text-emerald-400"
              onClick={() => switchRole("ADMIN")}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Switch to ADMIN Role</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 text-xs" asChild>
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <User className="h-3.5 w-3.5 text-nav-icon" />
              <span>Workspace Overview</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2 text-xs" asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-3.5 w-3.5 text-nav-icon" />
              <span>Settings {isViewer && "(Admin Only)"}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
            <CreditCard className="h-3.5 w-3.5 text-nav-icon" />
            <span>Billing & Tier</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut()}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
