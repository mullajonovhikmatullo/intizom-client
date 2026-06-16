import { useEffect, useState } from "react";
import { Habit, HabitType } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePicker, InputNumber } from "antd";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialType?: HabitType;
  habit?: Habit | null;
  onSave: (data: Omit<Habit, "id" | "createdAt"> & { id?: string }) => void | Promise<void>;
}

export function HabitDialog({ open, onOpenChange, initialType = "good", habit, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState<string | undefined>(undefined);
  const [type, setType] = useState<HabitType>(initialType);
  const [targetDays, setTargetDays] = useState(90);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(habit?.title ?? "");
      setTime(habit?.time || undefined);
      setType(habit?.type ?? initialType);
      setTargetDays(habit?.targetDays ?? 90);
      setSaving(false);
    }
  }, [open, habit, initialType]);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ id: habit?.id, title: title.trim(), time: time || undefined, type, targetDays });
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
          <DialogTitle>{habit ? "Odatni tahrirlash" : "Yangi odat"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Tabs value={type} onValueChange={(v) => setType(v as HabitType)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="good" className="rounded-lg">✅ Yaxshi odat</TabsTrigger>
              <TabsTrigger value="bad" className="rounded-lg">❌ Yomon odat</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="h-title">Nomi</Label>
            <Input id="h-title" placeholder="mas. 20 daqiqa o'qish" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Vaqt (ixtiyoriy)</Label>
              <TimePicker
                value={time ? dayjs(time, "HH:mm") : null}
                format="HH:mm"
                minuteStep={5}
                size="large"
                needConfirm={false}
                allowClear
                placeholder="Belgilanmagan"
                onChange={(val) => setTime(val ? val.format("HH:mm") : undefined)}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </div>
            <div className="space-y-2">
              <Label>Maqsad kunlar</Label>
              <InputNumber
                min={1}
                max={3650}
                value={targetDays}
                onChange={(val) => setTargetDays(Math.max(1, Number(val) || 1))}
                size="large"
                addonAfter="kun"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!title.trim() || saving}>
            {saving ? "Saqlanmoqda..." : habit ? "Saqlash" : "Yaratish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
