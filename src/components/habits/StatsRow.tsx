import { Flame, TrendingUp, Target } from "lucide-react";

interface Props {
  streak: number;
  todayPct: number;
  weekPct: number;
}

export function StatsRow({ streak, todayPct, weekPct }: Props) {
  const items = [
    { label: "Ketma-ketlik", value: `${streak}🔥`, icon: Flame, gradient: "gradient-warm" },
    { label: "Bugun", value: `${todayPct}%`, icon: Target, gradient: "gradient-primary" },
    { label: "Bu hafta", value: `${weekPct}%`, icon: TrendingUp, gradient: "gradient-success" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ label, value, icon: Icon, gradient }) => (
        <div
          key={label}
          className="flex min-w-0 items-center gap-1 rounded-xl border border-border/70 bg-card px-1.5 py-2 shadow-sm sm:gap-2 sm:px-3"
        >
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-7 sm:w-7 sm:rounded-lg ${gradient} text-white`}>
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold leading-none min-[360px]:text-sm">{value}</div>
            <div className="mt-0.5 whitespace-nowrap text-[8px] leading-tight tracking-[-0.02em] text-muted-foreground min-[360px]:text-[9px] min-[400px]:text-[10px]">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
