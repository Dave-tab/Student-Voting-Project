/**
 * ResultsLoadingSkeleton (B51)
 * Loading placeholder skeleton conforming to the platform's visual design system.
 */

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        <div className="space-y-2 pt-2">
          <Skeleton className="h-8 w-3/4 sm:w-1/2" />
          <Skeleton className="h-4 w-full sm:w-2/3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </Card>

      {/* Position Cards Skeletons */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-36" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
