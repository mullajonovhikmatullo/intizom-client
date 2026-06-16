import { useEffect, useState } from "react";
import { Loan, LoanInstallment } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  loan?: Loan | null;
  onSave: (data: Omit<Loan, "id" | "createdAt" | "installments"> & { id?: string }) => void | Promise<void>;
}

const CURRENCIES = [
  { label: "so'm", value: " so'm" },
  { label: "$", value: "$" },
];

export function LoanDialog({ open, onOpenChange, loan, onSave }: Props) {
  const { settings } = useTheme();
  const [title, setTitle] = useState("");
  const [totalMonths, setTotalMonths] = useState<number | null>(12);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [paymentDay, setPaymentDay] = useState<number | null>(5);
  const [currency, setCurrency] = useState(settings.currency);
  const [startDate, setStartDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(loan?.title ?? "");
      setTotalMonths(loan?.totalMonths ?? 12);
      setMonthlyPayment(loan?.monthlyPayment ?? null);
      setPaymentDay(loan?.paymentDay ?? 5);
      setCurrency(loan?.currency ?? settings.currency);
      setStartDate(loan?.startDate ?? dayjs().format("YYYY-MM-DD"));
      setNote(loan?.note ?? "");
      setSaving(false);
    }
  }, [open, loan, settings.currency]);

  const isUsd = currency === "$";

  const valid =
    title.trim().length > 0 &&
    !!totalMonths && totalMonths > 0 &&
    !!monthlyPayment && monthlyPayment > 0 &&
    !!paymentDay && paymentDay >= 1 && paymentDay <= 31;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await onSave({
        id: loan?.id,
        title: title.trim(),
        totalMonths: totalMonths!,
        monthlyPayment: monthlyPayment!,
        paymentDay: paymentDay!,
        currency,
        startDate,
        note: note.trim() || undefined,
      });
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
          <DialogTitle>{loan ? "Kreditni tahrirlash" : "Yangi kredit"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="l-title">Nomi</Label>
            <Input
              id="l-title"
              placeholder="mas. Uzcard kredit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Necha oyga</Label>
              <InputNumber
                min={1}
                max={120}
                value={totalMonths}
                onChange={(val) => setTotalMonths(val)}
                addonAfter="oy"
                size="large"
                style={{ width: "100%" }}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>To'lov kuni</Label>
              <InputNumber
                min={1}
                max={31}
                value={paymentDay}
                onChange={(val) => setPaymentDay(val)}
                addonBefore="har oyning"
                addonAfter="-kuni"
                size="large"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Oylik to'lov</Label>
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
              value={monthlyPayment}
              onChange={(val) => setMonthlyPayment(val)}
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
            <Label>Boshlanish sanasi</Label>
            <DatePicker
              value={dayjs(startDate, "YYYY-MM-DD")}
              format="DD.MM.YYYY"
              size="large"
              onChange={(val) => val && setStartDate(val.format("YYYY-MM-DD"))}
              style={{ width: "100%" }}
              getPopupContainer={(trigger) => trigger.parentElement!}
              allowClear={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="l-note">Izoh (ixtiyoriy)</Label>
            <Input
              id="l-note"
              placeholder="mas. Telefon uchun"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {totalMonths && monthlyPayment ? (
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              Jami:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {isUsd
                  ? `$${(totalMonths * monthlyPayment).toFixed(2)}`
                  : `${Math.round(totalMonths * monthlyPayment).toLocaleString()}${currency}`}
              </span>
            </div>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving ? "Saqlanmoqda..." : loan ? "Saqlash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper to (re)generate installments from loan parameters, preserving prior paid statuses by index.
export function buildInstallments(
  startDate: string,
  totalMonths: number,
  paymentDay: number,
  prior?: LoanInstallment[]
): LoanInstallment[] {
  const start = dayjs(startDate, "YYYY-MM-DD");
  const out: LoanInstallment[] = [];
  for (let i = 1; i <= totalMonths; i++) {
    const monthAnchor = start.add(i - 1, "month");
    const day = Math.min(paymentDay, monthAnchor.daysInMonth());
    const due = monthAnchor.date(day).format("YYYY-MM-DD");
    const existing = prior?.find((p) => p.index === i);
    out.push({
      id: existing?.id ?? crypto.randomUUID(),
      index: i,
      dueDate: due,
      paid: existing?.paid ?? false,
      paidDate: existing?.paidDate,
    });
  }
  return out;
}
