import { useEffect, useState } from "react";
import { Debt, DebtDirection } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import { todayKey } from "@/lib/date";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  debt?: Debt | null;
  initialDirection?: DebtDirection;
  onSave: (data: Omit<Debt, "id" | "createdAt" | "isPaid" | "payments"> & { id?: string }) => void | Promise<void>;
}

const CURRENCIES = [
  { label: "so'm", value: " so'm" },
  { label: "$", value: "$" },
];

export function DebtDialog({ open, onOpenChange, debt, initialDirection = "borrowed", onSave }: Props) {
  const { settings } = useTheme();
  const [direction, setDirection] = useState<DebtDirection>("borrowed");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState(settings.currency);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDirection(debt?.direction ?? initialDirection);
      setPerson(debt?.person ?? "");
      setAmount(debt?.amount ?? null);
      setCurrency(debt?.currency ?? settings.currency);
      setDueDate(debt?.dueDate);
      setNote(debt?.note ?? "");
      setSaving(false);
    }
  }, [open, debt, settings.currency, initialDirection]);

  const isUsd = currency === "$";

  const submit = async () => {
    if (!person.trim() || !amount || amount <= 0) return;
    setSaving(true);
    try {
      await onSave({
        id: debt?.id,
        direction,
        person: person.trim(),
        amount,
        currency,
        dueDate,
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
          <DialogTitle>{debt ? "Qarzni tahrirlash" : "Yangi qarz"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Tabs value={direction} onValueChange={(v) => setDirection(v as DebtDirection)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="borrowed" className="rounded-lg">💸 Men oldim</TabsTrigger>
              <TabsTrigger value="lent" className="rounded-lg">🤝 Men berdim</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="d-person">
              {direction === "borrowed" ? "Kimdan oldim?" : "Kimga berdim?"}
            </Label>
            <Input
              id="d-person"
              placeholder="mas. Jasur aka"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
            />
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
                  return isUsd
                    ? Number(val).toFixed(2)
                    : Number(val).toLocaleString();
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
              <Label>Muddati</Label>
              <DatePicker
                value={dueDate ? dayjs(dueDate, "YYYY-MM-DD") : null}
                format="DD.MM.YYYY"
                size="large"
                placeholder="Ixtiyoriy"
                onChange={(val) => setDueDate(val ? val.format("YYYY-MM-DD") : undefined)}
                disabledDate={(d) => d.isBefore(dayjs(todayKey()), "day")}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                allowClear
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-note">Izoh (ixtiyoriy)</Label>
            <Input
              id="d-note"
              placeholder="mas. Do'kon uchun"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!person.trim() || !amount || amount <= 0 || saving}>
            {saving ? "Saqlanmoqda..." : debt ? "Saqlash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
