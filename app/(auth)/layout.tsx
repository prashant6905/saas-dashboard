import * as React from "react";
import Link from "next/link";
import { Terminal, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary/20">
      {/* Background Grid & Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[350px] w-[600px] bg-primary/10 blur-[130px] rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/login"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-primary/10 text-primary shadow-xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight block">
              UrbanNest D2C
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Commerce Analytics
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground font-mono">
            <Shield className="h-3 w-3 text-emerald-500" />
            <span>256-BIT ENCRYPTED</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Form Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p className="font-mono text-[11px]">
          UrbanNest D2C Analytics • Supabase Auth Layer • All systems operational
        </p>
      </footer>
    </div>
  );
}
