import { Calendar, Badge, Segmented } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Habit, HabitLogs } from "@/lib/types";
import { dailyCompletion } from "@/lib/habits";
import { dateKey, todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

interface Props {
  habits: Habit[];
  logs: HabitLogs;
  selected: Date;
  onSelect: (d: Date) => void;
}

/**
 * Ant Design Calendar for habit history.
 * - Each cell shows a colored dot reflecting that day's completion %.
 * - Future days are disabled.
 */
export function HabitCalendar({ habits, logs, selected, onSelect }: Props) {
  const value = dayjs(selected);
  const today = dayjs();

  const cellRender = (current: Dayjs, info: { type: string }) => {
    if (info.type !== "date") return null;
    if (current.isAfter(today, "day")) return null;
    const key = dateKey(current.toDate());
    const activeHabits = habits.filter((h) => dateKey(new Date(h.createdAt)) <= key);
    if (activeHabits.length === 0) return null;
    const pct = dailyCompletion(habits, logs, key);

    const status: "success" | "warning" | "error" | "default" =
      pct === 100 ? "success" : pct >= 50 ? "warning" : pct > 0 ? "error" : "default";

    return (
      <div className="flex justify-center">
        <Badge status={status} text={<span className="text-[10px] tabular-nums text-muted-foreground">{pct}%</span>} />
      </div>
    );
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-2 shadow-sm")}>
      <Calendar
        fullscreen={false}
        value={value}
        onSelect={(d) => {
          if (d.isAfter(today, "day")) return;
          onSelect(d.toDate());
        }}
        cellRender={cellRender}
        headerRender={({ value: v, onChange }) => {
          const year = v.year();
          const month = v.month();
          const UZ_MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
          return (
            <div className="flex flex-col gap-2 px-2 pb-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-foreground">
                  {v.format("MMMM YYYY")}
                  {dateKey(v.toDate()) === todayKey() && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Bugun
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onChange(v.clone().subtract(1, "year"))}
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {year - 1}
                  </button>
                  <button
                    onClick={() => onChange(v.clone().add(1, "year"))}
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {year + 1}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
                <div className="[&_.ant-segmented-item-label]:!text-muted-foreground [&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-foreground">
                  <Segmented
                    size="small"
                    value={month}
                    onChange={(val) => onChange(v.clone().month(Number(val)).year(year))}
                    options={UZ_MONTHS.map((m, i) => ({ label: m, value: i }))}
                    style={{ whiteSpace: "nowrap" }}
                  />
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
