import { useEffect, useMemo, useState } from "react";
import { Expense, ExpenseCategory, Habit, HabitLogs } from "@/lib/types";
import {
  dailyCompletion,
  fetchHabitLogs,
  fetchHabits,
  habitStreak,
  rangeCompletion,
  streak as calcStreak,
} from "@/lib/habits";
import { dateKey, lastNDays, monthRange, weekRange } from "@/lib/date";
import { categoryMeta, CATEGORIES } from "@/lib/categories";
import { isToday, isThisWeek, isThisMonth, parseISO, format } from "date-fns";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Flame, LucideIcon, TrendingUp, Wallet, Trophy } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ChartLoading, ListLoading, StatGridLoading } from "@/components/DataLoading";
import { fetchExpenses } from "@/lib/expenses";
import { toast } from "sonner";

function sumByCurrency(items: Expense[]): Map<string, number> {
  const map = new Map<string, number>();
  items.forEach((e) => {
    const cur = e.currency ?? " so'm";
    map.set(cur, (map.get(cur) ?? 0) + e.amount);
  });
  return map;
}

function formatByCurrency(map: Map<string, number>, fallback = "0 so'm"): string {
  if (map.size === 0) return fallback;
  return Array.from(map.entries())
    .map(([cur, sum]) => (cur === "$" ? `$${sum.toFixed(0)}` : `${Math.round(sum).toLocaleString()}${cur}`))
    .join(" · ");
}

export function StatsContent() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogs>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadStats = async () => {
      try {
        const [remoteHabits, remoteLogs, remoteExpenses] = await Promise.all([
          fetchHabits(),
          fetchHabitLogs(),
          fetchExpenses(),
        ]);
        if (!alive) return;
        setHabits(remoteHabits);
        setLogs(remoteLogs);
        setExpenses(remoteExpenses);
      } catch {
        if (alive) toast.error("Statistikalarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadStats();

    return () => {
      alive = false;
    };
  }, []);

  const habitMetrics = useMemo(() => {
    const today = dailyCompletion(habits, logs);
    const wr = weekRange();
    const mr = monthRange();
    return {
      streak: calcStreak(habits, logs),
      today,
      week: rangeCompletion(habits, logs, wr.from, wr.to),
      month: rangeCompletion(habits, logs, mr.from, mr.to),
    };
  }, [habits, logs]);

  const last14 = useMemo(() => {
    return lastNDays(14).map((d) => ({
      day: format(d, "EEE")[0],
      date: format(d, "MMM d"),
      pct: dailyCompletion(habits, logs, dateKey(d)),
    }));
  }, [habits, logs]);

  const perHabitStreaks = useMemo(() => {
    return habits
      .map((h) => ({ habit: h, streak: habitStreak(h, logs) }))
      .sort((a, b) => b.streak - a.streak);
  }, [habits, logs]);

  const expenseTotals = useMemo(() => {
    const allSum = expenses.reduce((s, e) => s + e.amount, 0);
    return {
      today: sumByCurrency(expenses.filter((e) => isToday(parseISO(e.date)))),
      week: sumByCurrency(expenses.filter((e) => isThisWeek(parseISO(e.date), { weekStartsOn: 1 }))),
      month: sumByCurrency(expenses.filter((e) => isThisMonth(parseISO(e.date)))),
      all: sumByCurrency(expenses),
      allSum,
    };
  }, [expenses]);

  const byCategory = useMemo(() => {
    const sumMap = new Map<string, number>();
    const byCurMap = new Map<string, Map<string, number>>();
    expenses.forEach((e) => {
      sumMap.set(e.category, (sumMap.get(e.category) || 0) + e.amount);
      if (!byCurMap.has(e.category)) byCurMap.set(e.category, new Map());
      const cur = e.currency ?? " so'm";
      const cm = byCurMap.get(e.category)!;
      cm.set(cur, (cm.get(cur) ?? 0) + e.amount);
    });
    return CATEGORIES
      .map((cat) => ({
        name: cat.label,
        value: sumMap.get(cat.value) || 0,
        color: cat.color,
        key: cat.value,
        byCurrency: byCurMap.get(cat.value) ?? new Map<string, number>(),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const topCategory = byCategory[0];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">Odat jarayoni</h2>

        {loading ? (
          <StatGridLoading />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <BigStat label="Ketma-ketlik" value={`${habitMetrics.streak} kun`} icon={Flame} gradient="gradient-warm" />
            <BigStat label="Bugun" value={`${habitMetrics.today}%`} icon={TrendingUp} gradient="gradient-success" />
            <BigStat label="Bu hafta" value={`${habitMetrics.week}%`} icon={BarChart3} gradient="gradient-primary" />
            <BigStat label="Bu oy" value={`${habitMetrics.month}%`} icon={Trophy} gradient="gradient-warm" />
          </div>
        )}

        {loading ? (
          <ChartLoading />
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">So'nggi 14 kun</h3>
            <span className="text-xs text-muted-foreground">% bajarilish</span>
          </div>
          {habits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Tendensiyani ko'rish uchun odatlar qo'shing.</p>
          ) : (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last14} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number, _n, p) => [`${v}%`, p.payload.date]}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          </div>
        )}
        {!loading && perHabitStreaks.length > 0 && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Har bir odat ketma-ketligi</h3>
              <span className="text-xs text-muted-foreground">kun</span>
            </div>
            <ul className="space-y-2">
              {perHabitStreaks.map(({ habit, streak }) => (
                <li key={habit.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${habit.type === "good" ? "gradient-success" : "gradient-warm"} text-white`}>
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{habit.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {habit.type === "good" ? "Yaxshi odat" : "Yomon odat"}
                    </div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {streak} 🔥
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">Xarajatlar</h2>

        {loading ? (
          <StatGridLoading />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <SpendStat label="Bugun" value={formatByCurrency(expenseTotals.today)} />
            <SpendStat label="Bu hafta" value={formatByCurrency(expenseTotals.week)} />
            <SpendStat label="Bu oy" value={formatByCurrency(expenseTotals.month)} />
            <SpendStat label="Jami" value={formatByCurrency(expenseTotals.all)} />
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <ChartLoading />
            <ListLoading items={3} />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Kategoriya bo'yicha</h3>
            {topCategory && (
              <span className="text-xs text-muted-foreground">
                Eng ko'p: <span className="font-semibold text-foreground">{topCategory.name}</span>
              </span>
            )}
          </div>

          {byCategory.length === 0 ? (
            <EmptyState icon={Wallet} title="Xarajat ma'lumotlari yo'q" description="Diagrammalarni ochish uchun xarajatlarni kiriting." />
          ) : (
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={70} paddingAngle={2}>
                      {byCategory.map((d) => (
                        <Cell key={d.key} fill={d.color} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => `${Math.round(v).toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {byCategory.map((cat) => {
                  const meta = categoryMeta(cat.key as ExpenseCategory);
                  const Icon = meta.icon;
                  const pct = Math.round((cat.value / expenseTotals.allSum) * 100);
                  return (
                    <li key={cat.key} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium">{cat.name}</span>
                          <span className="text-sm font-semibold tabular-nums">{formatByCurrency(cat.byCurrency)}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          </div>
        )}
      </section>
    </div>
  );
}

function BigStat({ label, value, icon: Icon, gradient }: { label: string; value: string; icon: LucideIcon; gradient: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-2.5 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${gradient} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold leading-tight tabular-nums">{value}</div>
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function SpendStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-2.5 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Wallet className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold leading-tight tabular-nums">{value}</div>
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
