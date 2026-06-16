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
        <div key={label} className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 shadow-sm">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${gradient} text-white`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-none">{value}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground truncate">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
