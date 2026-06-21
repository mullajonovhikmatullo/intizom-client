import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListLoadingProps {
  items?: number;
  className?: string;
  itemClassName?: string;
}

export function ListLoading({ items = 3, className, itemClassName }: ListLoadingProps) {
  return (
    <div className={cn("space-y-2", className)} aria-label="Ma'lumotlar yuklanmoqda">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={cn("rounded-2xl border border-border/70 bg-card p-3 shadow-sm", itemClassName)}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-2xl border border-border/70 bg-card p-4 shadow-sm", className)}
      aria-label="Ma'lumotlar yuklanmoqda"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex h-40 items-end gap-2">
        {[45, 70, 56, 84, 38, 62, 76].map((height, index) => (
          <Skeleton key={index} className="flex-1 rounded-t-lg" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

export function StatGridLoading({ items = 4 }: { items?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Ma'lumotlar yuklanmoqda">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-2.5 shadow-sm">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
