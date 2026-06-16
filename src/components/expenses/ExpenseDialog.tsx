import { useEffect, useState } from "react";
import { Expense, ExpenseCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { todayKey } from "@/lib/date";
import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense?: Expense | null;
  onSave: (data: Omit<Expense, "id" | "createdAt"> & { id?: string }) => void | Promise<void>;
}

const CURRENCIES = [
  { label: "so'm", value: " so'm" },
  { label: "$", value: "$" },
];

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: Props) {
  const { settings } = useTheme();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState(settings.currency);
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState(todayKey());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(expense?.title ?? "");
      setAmount(expense?.amount ?? null);
      setCurrency(expense?.currency ?? settings.currency);
      setCategory(expense?.category ?? "food");
      setDate(expense?.date ?? todayKey());
      setSaving(false);
    }
  }, [open, expense, settings.currency]);

  const isUsd = currency === "$";

  const submit = async () => {
    if (!title.trim() || !amount || amount <= 0) return;
    setSaving(true);
    try {
      await onSave({ id: expense?.id, title: title.trim(), amount, currency, category, date });
      onOpenChange(false);
    } catch {
      // The page-level save handler shows the relevant toast and keeps the dialog open.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Xarajatni tahrirlash" : "Yangi xarajat"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="e-title">Nima sotib oldingiz?</Label>
            <Input id="e-title" placeholder="mas. Qahva" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Miqdor</Label>
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
                formatter={(val) => {
                  if (!val) return "";
                  return isUsd ? Number(val).toFixed(2) : Number(val).toLocaleString();
                }}
                parser={(val) => (val ? Number(val.replace(isUsd ? /[^\d.]/g : /[^\d]/g, "")) : 0)}
                placeholder={isUsd ? "0.00" : "0"}
                addonBefore={isUsd ? "$" : undefined}
                addonAfter={!isUsd ? "so'm" : undefined}
                size="large"
                style={{ width: "100%" }}
              />
            </div>
            <div className="space-y-2">
              <Label>Sana</Label>
              <DatePicker
                value={dayjs(date, "YYYY-MM-DD")}
                format="DD.MM.YYYY"
                size="large"
                onChange={(val) => setDate(val ? val.format("YYYY-MM-DD") : todayKey())}
                disabledDate={(d) => d.isAfter(dayjs(), "day")}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                allowClear={false}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kategoriya</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon }) => {
                const active = value === category;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-bounce tap-scale",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!title.trim() || !amount || amount <= 0 || saving}>
            {saving ? "Saqlanmoqda..." : expense ? "Saqlash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
