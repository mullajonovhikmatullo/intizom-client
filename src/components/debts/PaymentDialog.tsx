import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputNumber } from "antd";
import { Debt, DebtPayment } from "@/lib/types";
import { todayKey } from "@/lib/date";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  debt: Debt;
  remaining: number;
  onSave: (payment: Omit<DebtPayment, "id">) => void | Promise<void>;
}

export function PaymentDialog({ open, onOpenChange, debt, remaining, onSave }: Props) {
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const isUsd = debt.currency === "$";

  const reset = () => { setAmount(null); setNote(""); setSaving(false); };

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) reset();
  };

  const submit = async () => {
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await onSave({
        amount: Math.min(amount, remaining),
        date: todayKey(),
        note: note.trim() || undefined,
      });
      reset();
      onOpenChange(false);
    } catch {
      // The page-level save handler shows the relevant toast and keeps the dialog open.
    } finally {
      setSaving(false);
    }
  };

  const fmt = (val: number) =>
    isUsd ? `$${val.toFixed(2)}` : `${Math.round(val).toLocaleString()}${debt.currency}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>To'lov qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info strip */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">
            <span className="min-w-0 truncate font-medium">{debt.person}</span>
            <span className="shrink-0 text-muted-foreground">
              Qoldi: <span className="break-all font-semibold text-foreground tabular-nums">{fmt(remaining)}</span>
            </span>
          </div>

          {/* Quick fill buttons */}
          <div className="flex gap-2">
            {[0.25, 0.5, 1].map((ratio) => {
              const val = Math.round(remaining * ratio * (isUsd ? 100 : 1)) / (isUsd ? 100 : 1);
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="flex min-w-0 flex-1 flex-col items-center rounded-lg border border-border px-1 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <span>{ratio === 1 ? "To'liq" : `${ratio * 100}%`}</span>
                  <span className="w-full truncate text-center text-[10px] text-muted-foreground tabular-nums">{fmt(val)}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label>To'lov miqdori</Label>
            <InputNumber
              min={0.01}
              max={remaining}
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
            <Label>Izoh (ixtiyoriy)</Label>
            <Input
              placeholder="mas. Aprel oyi uchun"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!amount || amount <= 0 || saving}>
            {saving ? "Saqlanmoqda..." : "To'lovni saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
