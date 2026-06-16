import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Scale, Banknote, CreditCard, AlertTriangle } from "lucide-react";
import { Debt, DebtPayment, Loan } from "@/lib/types";
import { DebtCard } from "@/components/debts/DebtCard";
import { DebtDialog } from "@/components/debts/DebtDialog";
import { LoanCard } from "@/components/loans/LoanCard";
import { LoanDialog } from "@/components/loans/LoanDialog";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { ApiError } from "@/lib/api";
import {
  addDebtPayment as addDebtPaymentApi,
  createDebt,
  deleteDebt as deleteDebtApi,
  fetchDebts,
  setDebtPaid,
  updateDebt,
} from "@/lib/debts";
import {
  createLoan,
  deleteLoan as deleteLoanApi,
  fetchLoans,
  setLoanInstallmentPaid,
  updateLoan,
} from "@/lib/loans";

type Section = "debts" | "loans";

function showDebtFlowError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "PAST_DATE_NOT_ALLOWED") {
      toast.error("O'tgan sana muddat sifatida kiritilmaydi");
      return;
    }

    if (error.code === "DEBT_AMOUNT_TOO_SMALL") {
      toast.error("Qarz summasi to'langan miqdordan kichik bo'lmasligi kerak");
      return;
    }

    if (error.code === "PAYMENT_TOO_LARGE") {
      toast.error("To'lov qoldiq qarzdan oshib ketmasligi kerak");
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

// Group unpaid debt amounts by currency
function sumByCurrency(debts: Debt[]): Map<string, number> {
  const map = new Map<string, number>();
  debts.filter((d) => !d.isPaid).forEach((d) => {
    const paid = (d.payments ?? []).reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(0, d.amount - paid);
    map.set(d.currency, (map.get(d.currency) ?? 0) + remaining);
  });
  return map;
}

function sumLoansByCurrency(loans: Loan[]): Map<string, number> {
  const map = new Map<string, number>();
  loans.forEach((l) => {
    const remaining = l.installments.filter((i) => !i.paid).length * l.monthlyPayment;
    if (remaining > 0) map.set(l.currency, (map.get(l.currency) ?? 0) + remaining);
  });
  return map;
}

function formatCurrencyMap(map: Map<string, number>, sign = ""): string {
  if (map.size === 0) return sign + "0";
  return Array.from(map.entries())
    .map(([cur, val]) => {
      const isUsd = cur === "$";
      return isUsd
        ? `${sign}$${val.toFixed(2)}`
        : `${sign}${Math.round(val).toLocaleString()}${cur}`;
    })
    .join(" • ");
}

export default function DebtPage() {
  const [section, setSection] = useState<Section>("debts");

  // === Debts state ===
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [activeTab, setActiveTab] = useState<"borrowed" | "lent">("borrowed");
  const [initialDirection, setInitialDirection] = useState<"borrowed" | "lent">("borrowed");

  useEffect(() => {
    let alive = true;

    const loadDebts = async () => {
      try {
        const remoteDebts = await fetchDebts();
        if (alive) setDebts(remoteDebts);
      } catch (error) {
        if (alive) showDebtFlowError(error, "Qarzlarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoadingDebts(false);
      }
    };

    void loadDebts();

    return () => {
      alive = false;
    };
  }, []);

  const borrowed = useMemo(() => debts.filter((d) => d.direction === "borrowed"), [debts]);
  const lent = useMemo(() => debts.filter((d) => d.direction === "lent"), [debts]);
  const borrowedTotals = useMemo(() => sumByCurrency(borrowed), [borrowed]);
  const lentTotals = useMemo(() => sumByCurrency(lent), [lent]);

  const openNew = (direction: "borrowed" | "lent") => {
    setEditing(null);
    setInitialDirection(direction);
    setOpen(true);
  };

  const save = async (data: Omit<Debt, "id" | "createdAt" | "isPaid" | "payments"> & { id?: string }) => {
    if (data.id) {
      try {
        const updated = await updateDebt(data.id, data);
        setDebts((arr) => arr.map((d) => (d.id === updated.id ? updated : d)));
        toast.success("Qarz yangilandi");
      } catch (error) {
        showDebtFlowError(error, "Qarzni yangilab bo'lmadi");
        throw error;
      }
      return;
    }

    try {
      const created = await createDebt(data);
      setDebts((arr) => [created, ...arr]);
      toast.success("Qarz qo'shildi");
    } catch (error) {
      showDebtFlowError(error, "Qarzni qo'shib bo'lmadi");
      throw error;
    }
  };

  const remove = async (id: string) => {
    const previousDebts = debts;
    setDebts((arr) => arr.filter((d) => d.id !== id));
    try {
      await deleteDebtApi(id);
      toast.success("Qarz o'chirildi");
    } catch (error) {
      setDebts(previousDebts);
      showDebtFlowError(error, "Qarzni o'chirib bo'lmadi");
    }
  };

  const togglePaid = async (id: string) => {
    const current = debts.find((d) => d.id === id);
    if (!current) return;
    const nextPaid = !current.isPaid;
    const previousDebts = debts;
    setDebts((arr) => arr.map((d) => (d.id === id ? { ...d, isPaid: nextPaid } : d)));
    try {
      const updated = await setDebtPaid(id, nextPaid);
      setDebts((arr) => arr.map((d) => (d.id === id ? updated : d)));
    } catch (error) {
      setDebts(previousDebts);
      showDebtFlowError(error, "Qarz holatini saqlab bo'lmadi");
    }
  };

  const addPayment = async (id: string, payment: Omit<DebtPayment, "id">) => {
    try {
      const result = await addDebtPaymentApi(id, payment);
      setDebts((arr) => arr.map((d) => (d.id === id ? result.debt : d)));
      toast.success("To'lov qo'shildi");
    } catch (error) {
      showDebtFlowError(error, "To'lovni qo'shib bo'lmadi");
      throw error;
    }
  };

  // === Loans state ===
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loanOpen, setLoanOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const loansTotals = useMemo(() => sumLoansByCurrency(loans), [loans]);

  useEffect(() => {
    let alive = true;

    const loadLoans = async () => {
      try {
        const remoteLoans = await fetchLoans();
        if (alive) setLoans(remoteLoans);
      } catch (error) {
        if (alive) showDebtFlowError(error, "Kreditlarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoadingLoans(false);
      }
    };

    void loadLoans();

    return () => {
      alive = false;
    };
  }, []);

  const dueSoonCount = useMemo(() => {
    let c = 0;
    loans.forEach((l) => {
      const next = l.installments.find((i) => !i.paid);
      if (!next) return;
      const dl = differenceInCalendarDays(parseISO(next.dueDate), new Date());
      if (dl <= 1) c++;
    });
    return c;
  }, [loans]);

  const saveLoan = async (data: Omit<Loan, "id" | "createdAt" | "installments"> & { id?: string }) => {
    if (data.id) {
      try {
        const updated = await updateLoan(data.id, data);
        setLoans((arr) => arr.map((l) => (l.id === updated.id ? updated : l)));
        toast.success("Kredit yangilandi");
      } catch (error) {
        showDebtFlowError(error, "Kreditni yangilab bo'lmadi");
        throw error;
      }
      return;
    }

    try {
      const created = await createLoan(data);
      setLoans((arr) => [created, ...arr]);
      toast.success("Kredit qo'shildi");
    } catch (error) {
      showDebtFlowError(error, "Kreditni qo'shib bo'lmadi");
      throw error;
    }
  };

  const removeLoan = async (id: string) => {
    const previousLoans = loans;
    setLoans((arr) => arr.filter((l) => l.id !== id));
    try {
      await deleteLoanApi(id);
      toast.success("Kredit o'chirildi");
    } catch (error) {
      setLoans(previousLoans);
      showDebtFlowError(error, "Kreditni o'chirib bo'lmadi");
    }
  };

  const toggleInstallment = async (loanId: string, instId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    const installment = loan?.installments.find((i) => i.id === instId);
    if (!loan || !installment) return;
    const nextPaid = !installment.paid;
    const paidDate = nextPaid ? new Date().toISOString().slice(0, 10) : undefined;
    const previousLoans = loans;
    setLoans((arr) => arr.map((l) => {
      if (l.id !== loanId) return l;
      return {
        ...l,
        installments: l.installments.map((i) =>
          i.id === instId ? { ...i, paid: nextPaid, paidDate } : i
        ),
      };
    }));
    try {
      const updatedInstallment = await setLoanInstallmentPaid(loanId, instId, nextPaid, paidDate);
      setLoans((arr) => arr.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          installments: l.installments.map((i) => (i.id === instId ? updatedInstallment : i)),
        };
      }));
    } catch (error) {
      setLoans(previousLoans);
      showDebtFlowError(error, "Kredit to'lov holatini saqlab bo'lmadi");
    }
  };

  const activeLoans = loans.filter((l) => l.installments.some((i) => !i.paid));
  const finishedLoans = loans.filter((l) => l.installments.every((i) => i.paid));

  // FAB handler
  const handleFab = () => {
    if (section === "debts") openNew(activeTab);
    else { setEditingLoan(null); setLoanOpen(true); }
  };

  return (
    <>
      <AppHeader title="Qarzlar" subtitle="Moliyaviy majburiyatlar" />

      <div className="space-y-4 px-4 pt-4">
        {/* Top-level segmented switch (Section) */}
        <div className="relative grid grid-cols-2 rounded-2xl bg-muted p-1 text-sm font-semibold">
          <span
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-background shadow-sm transition-transform duration-300"
            style={{ transform: section === "loans" ? "translateX(100%)" : "translateX(0)" }}
            aria-hidden
          />
          <button
            onClick={() => setSection("debts")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-colors",
              section === "debts" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Banknote className="h-4 w-4" />
            Qarzlar
          </button>
          <button
            onClick={() => setSection("loans")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-colors",
              section === "loans" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className="h-4 w-4" />
            Kreditlar
            {dueSoonCount > 0 && (
              <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning-foreground">
                <AlertTriangle className="h-2.5 w-2.5" /> {dueSoonCount}
              </span>
            )}
          </button>
        </div>

        {/* === DEBTS SECTION === */}
        {section === "debts" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <SummaryCard label="Mening qarzim" text={formatCurrencyMap(borrowedTotals)} icon={TrendingDown} colorClass="text-destructive" bgClass="bg-destructive/10" />
              <SummaryCard label="Menga tegadi" text={formatCurrencyMap(lentTotals)} icon={TrendingUp} colorClass="text-success" bgClass="bg-success/10" />
              <NetCard borrowedTotals={borrowedTotals} lentTotals={lentTotals} />
            </div>

            {!loadingDebts && debts.length === 0 ? (
              <EmptyState
                icon={Banknote}
                title="Qarzlar yo'q"
                description="Kimdan qarz olganingizni yoki kimga qarz berganingizni kiriting."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => openNew("borrowed")} variant="outline" className="rounded-xl">
                      <Plus className="mr-1 h-4 w-4" /> Men oldim
                    </Button>
                    <Button onClick={() => openNew("lent")} className="rounded-xl">
                      <Plus className="mr-1 h-4 w-4" /> Men berdim
                    </Button>
                  </div>
                }
              />
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "borrowed" | "lent")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="borrowed" className="rounded-lg">
                    💸 Men oldim
                    {borrowed.filter((d) => !d.isPaid).length > 0 && (
                      <span className="ml-1.5 rounded-full bg-destructive/20 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                        {borrowed.filter((d) => !d.isPaid).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="lent" className="rounded-lg">
                    🤝 Men berdim
                    {lent.filter((d) => !d.isPaid).length > 0 && (
                      <span className="ml-1.5 rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                        {lent.filter((d) => !d.isPaid).length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {(["borrowed", "lent"] as const).map((dir) => {
                  const list = dir === "borrowed" ? borrowed : lent;
                  const emptyMsg = dir === "borrowed" ? "Hozircha qarz olganlar yo'q." : "Hozircha qarz berganlar yo'q.";
                  return (
                    <TabsContent key={dir} value={dir} className="mt-3 space-y-2">
                      {list.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">{emptyMsg}</p>
                      ) : (
                        <>
                          {list.filter((d) => !d.isPaid).map((d) => (
                            <DebtCard key={d.id} debt={d}
                              onEdit={() => { setEditing(d); setOpen(true); }}
                              onDelete={() => remove(d.id)}
                              onTogglePaid={() => togglePaid(d.id)}
                              onAddPayment={(p) => addPayment(d.id, p)} />
                          ))}
                          {list.some((d) => d.isPaid) && (
                            <details className="group">
                              <summary className="cursor-pointer list-none py-1 text-xs text-muted-foreground hover:text-foreground">
                                <span className="group-open:hidden">▶ To'langanlarni ko'rish ({list.filter((d) => d.isPaid).length})</span>
                                <span className="hidden group-open:inline">▼ Yashirish</span>
                              </summary>
                              <div className="mt-2 space-y-2">
                                {list.filter((d) => d.isPaid).map((d) => (
                                  <DebtCard key={d.id} debt={d}
                                    onEdit={() => { setEditing(d); setOpen(true); }}
                                    onDelete={() => remove(d.id)}
                                    onTogglePaid={() => togglePaid(d.id)}
                                    onAddPayment={(p) => addPayment(d.id, p)} />
                                ))}
                              </div>
                            </details>
                          )}
                        </>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>
        )}

        {/* === LOANS SECTION === */}
        {section === "loans" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <SummaryCard
                label="Qolgan kredit qarzi"
                text={formatCurrencyMap(loansTotals)}
                icon={CreditCard}
                colorClass="text-primary"
                bgClass="bg-primary/10"
              />
              <SummaryCard
                label="Yaqin to'lovlar (≤1 kun)"
                text={dueSoonCount === 0 ? "Yo'q" : `${dueSoonCount} ta`}
                icon={AlertTriangle}
                colorClass={dueSoonCount > 0 ? "text-warning-foreground" : "text-muted-foreground"}
                bgClass={dueSoonCount > 0 ? "bg-warning/20" : "bg-muted"}
              />
            </div>

            {!loadingLoans && loans.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Kreditlar yo'q"
                description="Bank yoki muassasaga oylik bo'lib to'laydigan kreditingizni qo'shing."
                action={
                  <Button onClick={() => { setEditingLoan(null); setLoanOpen(true); }} className="rounded-xl">
                    <Plus className="mr-1 h-4 w-4" /> Kredit qo'shish
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {activeLoans.map((l) => (
                  <LoanCard key={l.id} loan={l}
                    onEdit={() => { setEditingLoan(l); setLoanOpen(true); }}
                    onDelete={() => removeLoan(l.id)}
                    onTogglePaid={(instId) => toggleInstallment(l.id, instId)} />
                ))}
                {finishedLoans.length > 0 && (
                  <details className="group">
                    <summary className="cursor-pointer list-none py-1 text-xs text-muted-foreground hover:text-foreground">
                      <span className="group-open:hidden">▶ Yopilgan kreditlar ({finishedLoans.length})</span>
                      <span className="hidden group-open:inline">▼ Yashirish</span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      {finishedLoans.map((l) => (
                        <LoanCard key={l.id} loan={l}
                          onEdit={() => { setEditingLoan(l); setLoanOpen(true); }}
                          onDelete={() => removeLoan(l.id)}
                          onTogglePaid={(instId) => toggleInstallment(l.id, instId)} />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleFab}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-bounce tap-scale hover:scale-105"
        aria-label={section === "debts" ? "Qarz qo'shish" : "Kredit qo'shish"}
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <DebtDialog open={open} onOpenChange={setOpen} debt={editing} initialDirection={initialDirection} onSave={save} />
      <LoanDialog open={loanOpen} onOpenChange={setLoanOpen} loan={editingLoan} onSave={saveLoan} />
    </>
  );
}

interface SummaryCardProps {
  label: string;
  text: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

function SummaryCard({ label, text, icon: Icon, colorClass, bgClass }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bgClass, colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-sm font-bold tabular-nums leading-tight", colorClass)} title={text}>
          {text}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function NetCard({ borrowedTotals, lentTotals }: { borrowedTotals: Map<string, number>; lentTotals: Map<string, number> }) {
  const allCurrencies = new Set([...borrowedTotals.keys(), ...lentTotals.keys()]);
  const netMap = new Map<string, number>();
  allCurrencies.forEach((cur) => {
    const net = (lentTotals.get(cur) ?? 0) - (borrowedTotals.get(cur) ?? 0);
    netMap.set(cur, net);
  });

  const isPositive = Array.from(netMap.values()).every((v) => v >= 0);
  const isNegative = Array.from(netMap.values()).every((v) => v <= 0);
  const colorClass = isPositive ? "text-success" : isNegative ? "text-destructive" : "text-foreground";
  const bgClass = isPositive ? "bg-success/10" : isNegative ? "bg-destructive/10" : "bg-muted";

  const text = netMap.size === 0
    ? "0"
    : Array.from(netMap.entries()).map(([cur, val]) => {
        const sign = val > 0 ? "+" : "";
        const isUsd = cur === "$";
        return isUsd
          ? `${sign}$${Math.abs(val).toFixed(2)}`
          : `${sign}${Math.round(Math.abs(val)).toLocaleString()}${cur}`;
      }).join(" • ");

  return <SummaryCard label="Saldo" text={text} icon={Scale} colorClass={colorClass} bgClass={bgClass} />;
}
