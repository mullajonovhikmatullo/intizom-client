import { addDays, isSameDay, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
}

export function DateStrip({ selected, onSelect }: Props) {
  const today = new Date();
  const isToday = isSameDay(selected, today);
  const label = `${selected.getDate()}-${UZ_MONTHS[selected.getMonth()]} ${selected.getFullYear()}`;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-1.5">
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onSelect(subDays(selected, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Oldingi kun"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{label}</span>
        <button
          onClick={() => onSelect(addDays(selected, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Keyingi kun"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={() => onSelect(today)}
        className={cn(
          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
          isToday
            ? "invisible"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        Bugun
      </button>
    </div>
  );
}
