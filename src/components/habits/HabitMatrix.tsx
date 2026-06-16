import { useMemo, useState } from "react";
import { Habit, HabitLogs } from "@/lib/types";
import { dateKey, todayKey, weekRange, rangeDays } from "@/lib/date";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  habits: Habit[];
  logs: HabitLogs;
  onToggle: (habitId: string, dateKey: string) => void;
}

const UZ_DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function HabitMatrix({ habits, logs, onToggle }: Props) {
  const [anchor, setAnchor] = useState<Date>(new Date());

  const { from, to, days } = useMemo(() => {
    const { from, to } = weekRange(anchor);
    return { from, to, days: rangeDays(from, to) };
  }, [anchor]);

  const today = todayKey();

  const habitColPct = (h: Habit, key: string) => {
    // Per-habit success on a date: good = checked, bad = not checked
    const checked = !!logs[h.id]?.[key];
    return h.type === "good" ? (checked ? 100 : 0) : (checked ? 0 : 100);
  };

  const dayColPct = (key: string) => {
    const active = habits.filter((h) => dateKey(new Date(h.createdAt)) <= key && key <= today);
    if (active.length === 0) return null;
    let done = 0;
    active.forEach((h) => {
      const checked = !!logs[h.id]?.[key];
      if (h.type === "good" ? checked : !checked) done++;
    });
    return Math.round((done / active.length) * 100);
  };

  const rowPct = (h: Habit) => {
    const created = dateKey(new Date(h.createdAt));
    const valid = days.filter((d) => {
      const k = dateKey(d);
      return k >= created && k <= today;
    });
    if (valid.length === 0) return null;
    const done = valid.reduce((s, d) => s + (habitColPct(h, dateKey(d)) === 100 ? 1 : 0), 0);
    return Math.round((done / valid.length) * 100);
  };

  const rangeLabel = `${format(from, "d MMM")} – ${format(to, "d MMM")}`;

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Hozircha odatlar yo'q.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg"
          onClick={() => setAnchor((d) => addDays(d, -7))}
          aria-label="Oldingi hafta"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-foreground">{rangeLabel}</div>
          <button
            onClick={() => setAnchor(new Date())}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Joriy haftaga qaytish
          </button>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg"
          onClick={() => setAnchor((d) => addDays(d, 7))}
          aria-label="Keyingi hafta"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="sticky left-0 z-10 min-w-[140px] bg-muted/30 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Odat
              </th>
              {days.map((d, i) => {
                const key = dateKey(d);
                const isToday = key === today;
                const pct = dayColPct(key);
                return (
                  <th
                    key={key}
                    className={cn(
                      "px-1 py-2 text-center text-[10px] font-medium text-muted-foreground",
                      isToday && "text-primary"
                    )}
                  >
                    <div>{UZ_DAYS[i]}</div>
                    <div className={cn("text-xs font-semibold", isToday ? "text-primary" : "text-foreground")}>
                      {format(d, "d")}
                    </div>
                    <div className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                      {pct === null ? "—" : `${pct}%`}
                    </div>
                  </th>
                );
              })}
              <th className="px-2 py-2 text-center text-[10px] font-medium text-muted-foreground">
                Hafta
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const created = dateKey(new Date(h.createdAt));
              const pct = rowPct(h);
              return (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          h.type === "good" ? "bg-success" : "bg-destructive"
                        )}
                      />
                      <span className="truncate text-sm font-medium text-foreground">{h.title}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const key = dateKey(d);
                    const isFuture = key > today;
                    const beforeCreate = key < created;
                    const disabled = isFuture || beforeCreate;
                    const checked = !!logs[h.id]?.[key];
                    return (
                      <td key={key} className="px-1 py-2 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => !disabled && onToggle(h.id, key)}
                            className={cn(
                              "h-4 w-4 rounded",
                              h.type === "bad" && "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            )}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-xs font-semibold tabular-nums text-foreground">
                    {pct === null ? "—" : `${pct}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
