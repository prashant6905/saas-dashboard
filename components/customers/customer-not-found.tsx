import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Home, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerNotFoundProps {
  customerId?: string;
}

export function CustomerNotFound({ customerId }: CustomerNotFoundProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/70 text-center shadow-xs">
        <CardContent className="pt-8 pb-8 px-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <UserX className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">
              Customer Not Found
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {customerId ? (
                <>
                  No customer record was found matching identifier{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    {customerId}
                  </code>
                  .
                </>
              ) : (
                "The requested customer account could not be located in the customer directory."
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button asChild variant="default" size="sm" className="w-full sm:w-auto text-xs">
              <Link href="/customers">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                <span>Return to Customers</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              <Link href="/dashboard">
                <Home className="h-3.5 w-3.5 mr-1.5" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
