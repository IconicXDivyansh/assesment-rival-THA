"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <AlertCircleIcon className="size-10 text-destructive" aria-hidden="true" />
      <h2 className="font-heading text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Unable to load your tasks. Please try again.
      </p>
      <Button onClick={reset}>Retry</Button>
    </main>
  );
}
