import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Expense } from "@/lib/types";
import { ExpenseItem } from "@/components/expenses/ExpenseItem";
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog";
import { ExpenseCalendar } from "@/components/expenses/ExpenseCalendar";
import { EmptyState } from "@/components/EmptyState";
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  createExpense,
  deleteExpense as deleteExpenseApi,
  fetchExpenses,
  updateExpense,
} from "@/lib/expenses";

function showExpenseError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "FUTURE_DATE_NOT_ALLOWED") {
      toast.error("Kelajak sanasiga xarajat kiritib bo'lmaydi");
      return;
    }

    if (error.code === "UNAUTHORIZED" || error.code === "TOKEN_EXPIRED") {
      toast.error("Sessiya tugagan. Qayta kiring");
      return;
    }

    if (error.code === "VALIDATION_ERROR") {
      toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
      return;
    }
  }

  toast.error(fallback);
}

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filterDate, setFilterDate] = useState<Date>(new Date());

  useEffect(() => {
    let alive = true;

    const loadExpenses = async () => {
      try {
        const remoteExpenses = await fetchExpenses();
        if (alive) setExpenses(remoteExpenses);
      } catch (error) {
        if (alive) showExpenseError(error, "Xarajatlarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadExpenses();

    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(
    () => [...expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt))),
    [expenses]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    const filterKey = format(filterDate, "yyyy-MM-dd");
    sorted.forEach((e) => {
      if (e.date !== filterKey) return;
      const arr = map.get(e.date) || [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return Array.from(map.entries());
  }, [sorted, filterDate]);

  const todayByCur = useMemo(() => sumByCurrency(expenses.filter((e) => isToday(parseISO(e.date)))), [expenses]);
  const weekByCur = useMemo(() => sumByCurrency(expenses.filter((e) => isThisWeek(parseISO(e.date), { weekStartsOn: 1 }))), [expenses]);
  const monthByCur = useMemo(() => sumByCurrency(expenses.filter((e) => isThisMonth(parseISO(e.date)))), [expenses]);

  const save = async (data: Omit<Expense, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      try {
        const updated = await updateExpense(data.id, data);
        setExpenses((arr) => arr.map((e) => (e.id === updated.id ? updated : e)));
        toast.success("Xarajat yangilandi");
      } catch (error) {
        showExpenseError(error, "Xarajatni yangilab bo'lmadi");
        throw error;
      }
      return;
    }

    try {
      const created = await createExpense(data);
      setExpenses((arr) => [created, ...arr]);
      toast.success("Xarajat qo'shildi");
    } catch (error) {
      showExpenseError(error, "Xarajatni qo'shib bo'lmadi");
      throw error;
    }
  };

  const remove = async (id: string) => {
    const previousExpenses = expenses;
    setExpenses((arr) => arr.filter((e) => e.id !== id));
    try {
      await deleteExpenseApi(id);
      toast.success("Xarajat o'chirildi");
    } catch (error) {
      setExpenses(previousExpenses);
      showExpenseError(error, "Xarajatni o'chirib bo'lmadi");
    }
  };

  const todayLines = todayByCur.size === 0
    ? [{ key: "empty", text: "0 so'm" }]
    : Array.from(todayByCur.entries()).map(([cur, sum]) => ({
        key: cur,
        text: cur === "$" ? `$${sum.toFixed(0)}` : `${Math.round(sum).toLocaleString()}${cur}`,
      }));

  return (
    <>
      <AppHeader title="Xarajatlar" subtitle="Har bir tiyinni kuzating" />

      <div className="space-y-5 px-4 pt-4">
        {/* Compact summary */}
        <div className="rounded-2xl gradient-primary px-4 py-3 text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-wide opacity-80">Bugun</div>
              <div className="mt-0.5 truncate text-xl font-bold leading-tight tabular-nums">
                {todayLines.map((l) => l.text).join(" · ")}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1 text-right text-xs">
              <div className="flex items-center justify-end gap-1.5 rounded-lg bg-white/15 px-2 py-0.5 backdrop-blur">
                <span className="opacity-80">Hafta</span>
                <span className="font-semibold tabular-nums">{formatByCurrency(weekByCur)}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 rounded-lg bg-white/15 px-2 py-0.5 backdrop-blur">
                <span className="opacity-80">Oy</span>
                <span className="font-semibold tabular-nums">{formatByCurrency(monthByCur)}</span>
              </div>
            </div>
          </div>
        </div>

        {!loading && expenses.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Xarajatlar yo'q"
            description="Xarajatlarni ko'rish uchun birinchi xaridingizni kiriting."
            action={
              <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl">
                <Plus className="mr-1 h-4 w-4" /> Xarajat qo'shish
              </Button>
            }
          />
        ) : (
          <>
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-muted-foreground">Taqvim</h2>
                {format(filterDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd") && (
                  <Button size="sm" variant="ghost" className="h-7 rounded-lg px-2 text-xs"
                    onClick={() => setFilterDate(new Date())}>
                    Bugunga qaytish
                  </Button>
                )}
              </div>
              <ExpenseCalendar
                expenses={expenses}
                selected={filterDate}
                onSelect={(d) => setFilterDate(d ?? new Date())}
              />
            </section>
          <div className="space-y-5">
            {grouped.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
                Bu kunda xarajatlar yo'q.
              </p>
            ) : grouped.map(([date, items]) => {
              const groupByCur = sumByCurrency(items);
              return (
                <section key={date} className="space-y-2">
                  <div className="flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      {format(parseISO(date), "EEEE, MMM d")}
                    </h2>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatByCurrency(groupByCur)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((e) => (
                      <ExpenseItem key={e.id} expense={e}
                        onEdit={() => { setEditing(e); setOpen(true); }} onDelete={() => remove(e.id)} />
                    ))}
                  </div>
                </section>
              );
            })}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => { setEditing(null); setOpen(true); }}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-bounce tap-scale hover:scale-105"
        aria-label="Xarajat qo'shish"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <ExpenseDialog open={open} onOpenChange={setOpen} expense={editing} onSave={save} />
    </>
  );
}
