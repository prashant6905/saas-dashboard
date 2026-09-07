import * as React from "react";
import Link from "next/link";
import { Shield, Key, Bell, Globe, ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerAuthUser } from "@/lib/auth/server-auth";

export default async function SettingsPage() {
  const user = await getServerAuthUser();

  // Server-side RBAC enforcement: If user is not authenticated or not ADMIN, deny access
  if (!user || user.role !== "ADMIN") {
    const userEmail = user?.email || "Anonymous Visitor";
    const userRole = user?.role || "UNAUTHENTICATED";

    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Workspace administrative configurations and security controls."
          badge={
            <Badge variant="destructive" className="text-[10px] font-mono uppercase">
              Restricted
            </Badge>
          }
        />

        <Card className="border-rose-500/30 bg-rose-500/5 max-w-2xl mx-auto shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-rose-600 dark:text-rose-400">
                  Access Restricted: Administrator Privileges Required
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Role-Based Access Control (RBAC) security enforcement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Your account (<span className="font-medium text-foreground">{userEmail}</span>) is assigned the{" "}
              <Badge variant="outline" className="font-mono text-[10px] mx-1">{userRole}</Badge> status.
              Only verified Organization Administrators can view or modify security and workspace settings.
            </p>

            <div className="rounded-md border border-border/80 bg-background/50 p-3 space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                <span>Restricted Capabilities for Viewer Role:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                <li>Workspace environment and regional telemetry configuration</li>
                <li>Supabase project API keys and PostgreSQL Row-Level Security rules</li>
                <li>System anomaly and velocity alert notification thresholds</li>
                <li>Direct telemetry and operational data exports</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Dashboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage organization access, security controls, Supabase credentials, and notification thresholds."
        badge={
          <Badge variant="outline" className="text-[10px] font-mono uppercase">
            Administration
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>
              Enforced role policies for team members and external viewers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-medium">Administrator</div>
                  <div className="text-[11px] text-muted-foreground">
                    Full read/write telemetry & SQL policies
                  </div>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <div className="text-xs font-medium">Viewer Role</div>
                  <div className="text-[11px] text-muted-foreground">
                    Read-only charts and operational views
                  </div>
                </div>
              </div>
              <Badge variant="outline">Restricted Export</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Supabase Integration</CardTitle>
            <CardDescription>
              PostgreSQL database connection and Row-Level Security rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2.5">
                <Key className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <div className="text-xs font-medium">Supabase Project URL & Anon Key</div>
                  <div className="text-[11px] text-muted-foreground">
                    Configured via .env.local
                  </div>
                </div>
              </div>
              <Badge variant="neutral">Connected</Badge>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <div className="text-xs font-medium">Edge API Region</div>
                  <div className="text-[11px] text-muted-foreground">
                    ap-south-1 (Mumbai, India)
                  </div>
                </div>
              </div>
              <Badge variant="outline">Default</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
            <CardDescription>
              Telemetry alerts for anomalous order velocity or revenue dips.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <div className="text-xs font-medium">Velocity Spikes & Dropoffs</div>
                  <div className="text-[11px] text-muted-foreground">
                    Notify administrators on ±25% volume shifts
                  </div>
                </div>
              </div>
              <Badge variant="neutral">Disabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Workspace Organization</CardTitle>
            <CardDescription>
              UrbanNest D2C workspace identifiers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/60 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Workspace Slug</span>
                <span className="font-mono text-[11px] text-muted-foreground">urbannest-d2c-prod-01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Plan Tier</span>
                <Badge variant="outline" className="text-[10px]">D2C Growth Suite</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
