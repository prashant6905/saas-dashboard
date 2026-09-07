import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6 rounded-xl border border-border bg-card p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileQuestion className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-primary">
            404 Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The resource, order record, or analytics horizon you requested could not be located in Command Center.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button asChild variant="default">
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orders" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
