import { useEffect, useState } from "react";
import { getDaysInMonth } from "date-fns";
import { InputNumber } from "antd";
import { ExpenseBudget } from "@/lib/types";
import { formatMoney, monthlyFromWeekly } from "@/lib/budget";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  budget: ExpenseBudget | null;
  onSave: (data: ExpenseBudget) => Promise<void>;
  onDelete: () => Promise<void>;
}

const CURRENCIES = [
  { label: "so'm", value: " so'm" },
  { label: "$", value: "$" },
];

export function BudgetDialog({ open, onOpenChange, budget, onSave, onDelete }: Props) {
  const { settings } = useTheme();
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState(settings.currency);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(budget?.weeklyAmount ?? null);
      setCurrency(budget?.currency ?? settings.currency);
      setSaving(false);
    }
  }, [open, budget, settings.currency]);

  const isUsd = currency === "$";
  const valid = !!amount && amount > 0;

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
      onOpenChange(false);
    } catch {
      // The page-level handler shows the relevant toast and keeps the dialog open.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Haftalik maqsad</DialogTitle>
          <DialogDescription>Bir haftada ko'pi bilan qancha sarflashni rejalashtiryapsiz?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Haftalik limit</Label>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCurrency(c.value)}
                    className={cn(
                      "w-12 py-0.5 text-xs font-medium transition-colors",
                      currency === c.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <InputNumber
              min={0}
              value={amount}
              onChange={(val) => setAmount(val)}
              formatter={(val) => (val ? Number(val).toLocaleString() : "")}
              parser={(val) => (val ? Number(val.replace(/[^\d]/g, "")) : 0)}
              placeholder="0"
              addonBefore={isUsd ? "$" : undefined}
              addonAfter={!isUsd ? "so'm" : undefined}
              size="large"
              style={{ width: "100%" }}
            />
          </div>

          {valid && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-secondary/60 px-2 py-2">
                <div className="text-[11px] text-muted-foreground">Kunlik</div>
                <div className="text-sm font-bold tabular-nums">{formatMoney(amount / 7, currency)}</div>
              </div>
              <div className="rounded-xl bg-secondary/60 px-2 py-2">
                <div className="text-[11px] text-muted-foreground">Oylik (shu oy, {getDaysInMonth(new Date())} kun)</div>
                <div className="text-sm font-bold tabular-nums">{formatMoney(monthlyFromWeekly(amount), currency)}</div>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Faqat shu valyutadagi xarajatlar maqsadga hisoblanadi.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          {budget && (
            <Button variant="ghost" className="text-destructive hover:text-destructive sm:mr-auto" disabled={saving}
              onClick={() => run(onDelete)}>
              O'chirish
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button disabled={!valid || saving} onClick={() => valid && run(() => onSave({ weeklyAmount: amount, currency }))}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
