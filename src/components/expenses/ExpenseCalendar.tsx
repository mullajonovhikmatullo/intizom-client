import { useMemo, useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isAfter,
  format, addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Expense } from "@/lib/types";
import { cn } from "@/lib/utils";

const UZ_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const DAY_LABELS = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];

function fmtCompact(amount: number, currency: string): string {
  if (currency === "$") {
    return amount >= 1000 ? `$${(amount / 1000).toFixed(0)}K` : `$${amount.toFixed(0)}`;
  }
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${Math.round(amount)}`;
}

interface Props {
  expenses: Expense[];
  selected?: Date | null;
  onSelect?: (d: Date | null) => void;
}

export function ExpenseCalendar({ expenses, selected, onSelect }: Props) {
  const [month, setMonth] = useState(new Date());
  const today = new Date();

  // date → currency → total
  const totals = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    expenses.forEach((e) => {
      const cur = e.currency ?? " so'm";
      if (!map.has(e.date)) map.set(e.date, new Map());
      const byCur = map.get(e.date)!;
      byCur.set(cur, (byCur.get(cur) ?? 0) + e.amount);
    });
    return map;
  }, [expenses]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {UZ_MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const isFuture = isAfter(day, today);
          const isSelected = !!selected && isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const byCur = inMonth && !isFuture ? totals.get(key) : undefined;

          // Pick primary currency label: prefer so'm, else first
          let amountLabel = "";
          if (byCur && byCur.size > 0) {
            const somEntry = [...byCur.entries()].find(([c]) => c !== "$");
            const [cur, amt] = somEntry ?? [...byCur.entries()][0];
            amountLabel = fmtCompact(amt, cur);
          }

          return (
            <button
              key={key}
              disabled={isFuture || !inMonth}
              onClick={() => {
                if (!onSelect || isFuture || !inMonth) return;
                onSelect(selected && isSameDay(selected, day) ? null : day);
              }}
              className={cn(
                "flex h-10 flex-col items-center text-sm font-medium transition-colors",
                !inMonth && "pointer-events-none opacity-0",
                isFuture && inMonth && "cursor-default opacity-30",
                !isSelected && isToday && "text-primary",
                !isSelected && !isToday && inMonth && !isFuture && "hover:text-foreground",
              )}
            >
              {/* Sana + summa birgalikda markazlangan */}
              <div className="flex flex-col items-center justify-center gap-0.5 h-full w-full">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-[4px] text-sm leading-none transition-colors",
                  isSelected && "gradient-primary text-primary-foreground",
                  !isSelected && isToday && "border border-primary",
                  !isSelected && !isToday && inMonth && !isFuture && "hover:bg-muted",
                )}>
                  {day.getDate()}
                </div>
                <span className={cn(
                  "h-2.5 text-[8px] font-semibold leading-none tabular-nums",
                  amountLabel ? (isSelected ? "text-primary-foreground/80" : "text-primary") : "invisible",
                )}>
                  {amountLabel || "0"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
