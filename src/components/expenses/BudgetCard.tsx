import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Pencil, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Expense, ExpenseBudget } from "@/lib/types";
import { budgetProgress, BudgetStatus, formatMoney } from "@/lib/budget";

interface Props {
  budget: ExpenseBudget | null;
  expenses: Expense[];
  onEdit: () => void;
}

const STATUS_STYLES: Record<BudgetStatus, { icon: typeof CheckCircle2; box: string; bar: string }> = {
  ok: { icon: CheckCircle2, box: "border-success/30 bg-success/10 text-success", bar: "bg-success" },
  ahead: { icon: AlertTriangle, box: "border-warning/40 bg-warning/10 text-warning", bar: "bg-warning" },
  over: { icon: XCircle, box: "border-destructive/30 bg-destructive/10 text-destructive", bar: "bg-destructive" },
};

const statusFor = (spent: number, limit: number, planToDate: number): BudgetStatus =>
  spent > limit ? "over" : spent > planToDate ? "ahead" : "ok";

function GoalRow({
  label,
  spent,
  limit,
  status,
  currency,
}: {
  label: string;
  spent: number;
  limit: number;
  status: BudgetStatus;
  currency: string;
}) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          <span className="font-semibold text-foreground">{formatMoney(spent, currency)}</span>
          <span className="text-muted-foreground"> / {formatMoney(limit, currency)}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", STATUS_STYLES[status].bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BudgetCard({ budget, expenses, onEdit }: Props) {
  const progress = useMemo(() => (budget ? budgetProgress(budget, expenses) : null), [budget, expenses]);

  if (!budget || !progress) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-left transition-base hover:border-primary/50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Haftalik maqsad qo'ying</div>
          <div className="text-xs text-muted-foreground">
            Haftasiga qancha sarflashni rejalashtiring: kunlik va oylik limit avtomatik hisoblanadi.
          </div>
        </div>
      </button>
    );
  }

  const { currency } = budget;
  const p = progress;
  const StatusIcon = STATUS_STYLES[p.status].icon;
  const remainingWeek = p.weekly - p.weekSpent;

  const message =
    p.status === "over"
      ? `Haftalik maqsaddan ${formatMoney(-remainingWeek, currency)} oshib ketdingiz`
      : p.status === "ahead"
        ? `Rejadan ${formatMoney(p.weekSpent - p.weekPlanToDate, currency)} ortiq sarfladingiz`
        : "Reja bo'yicha ketyapsiz";

  const hint =
    p.status === "over"
      ? "Qolgan kunlarda xarajatni minimal qiling."
      : p.daysLeftInWeek > 0
        ? `Hafta oxirigacha ${formatMoney(remainingWeek, currency)} qoldi — kuniga ~${formatMoney(
            remainingWeek / p.daysLeftInWeek,
            currency
          )}`
        : `Hafta yakuniga ${formatMoney(remainingWeek, currency)} qoldi`;

  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-primary" /> Xarajat maqsadlari
        </h2>
        <Button size="sm" variant="ghost" className="h-7 rounded-lg px-2 text-xs" onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" /> O'zgartirish
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Kunlik", value: p.daily },
          { label: "Haftalik", value: p.weekly },
          { label: "Oylik", value: p.monthly },
        ].map((g) => (
          <div key={g.label} className="rounded-xl bg-secondary/60 px-2 py-2">
            <div className="text-[11px] text-muted-foreground">{g.label}</div>
            <div className="truncate text-sm font-bold tabular-nums">{formatMoney(g.value, currency)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <GoalRow label="Bugun" spent={p.todaySpent} limit={p.daily} currency={currency}
          status={statusFor(p.todaySpent, p.daily, p.daily)} />
        <GoalRow label="Shu hafta" spent={p.weekSpent} limit={p.weekly} currency={currency} status={p.status} />
        <GoalRow label="Shu oy" spent={p.monthSpent} limit={p.monthly} currency={currency}
          status={statusFor(p.monthSpent, p.monthly, p.monthPlanToDate)} />
      </div>

      <div className={cn("flex items-start gap-2 rounded-xl border px-3 py-2", STATUS_STYLES[p.status].box)}>
        <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{message}</div>
          <div className="text-xs text-foreground/70">{hint}</div>
        </div>
      </div>
    </section>
  );
}
