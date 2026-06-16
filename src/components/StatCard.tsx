import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bgClass, colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("text-lg font-bold tabular-nums leading-tight", colorClass)}>{value}</div>
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
