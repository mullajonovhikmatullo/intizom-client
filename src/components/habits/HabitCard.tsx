import { Habit, HabitLogs } from "@/lib/types";
import { Check, Clock, Pencil, Trash2, Flame, Target, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { dateKey, todayKey } from "@/lib/date";
import { daysCompletedTowardGoal, isCompleted } from "@/lib/habits";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Props {
  habit: Habit;
  logs: HabitLogs;
  selectedDate: Date;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export function HabitCard({ habit, logs, selectedDate, onToggle, onEdit, onDelete, onTogglePin }: Props) {
  const [confirm, setConfirm] = useState(false);
  const key = dateKey(selectedDate);
  const isFuture = key > todayKey();
  const checked = isCompleted(logs, habit.id, key);
  const completed = daysCompletedTowardGoal(habit, logs);
  const pct = Math.min(100, Math.round((completed / habit.targetDays) * 100));

  // visual: for "good", checked=success; for "bad", checked=relapse
  const positive = habit.type === "good" ? checked : !checked;

  return (
    <div className={cn(
      "group rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-base hover:shadow-soft animate-fade-in",
      habit.pinned ? "border-primary/40 ring-1 ring-primary/20" : "border-border/70"
    )}>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggle}
          disabled={isFuture}
          aria-label={checked ? "Bekor qilish" : "Belgilash"}
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-bounce tap-scale",
            isFuture && "opacity-50 cursor-not-allowed",
            habit.type === "good"
              ? checked
                ? "border-success bg-success text-success-foreground shadow-glow"
                : "border-border bg-background hover:border-primary"
              : checked
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border bg-background hover:border-destructive/60"
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 animate-pop" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn("truncate text-sm font-semibold leading-tight flex items-center gap-1.5", positive && checked && "text-success")}>
                {habit.pinned && <Pin className="h-3 w-3 shrink-0 fill-primary text-primary" />}
                <span className="truncate">{habit.title}</span>
              </h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                {habit.time && <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{habit.time}</span>}
                <span className="inline-flex items-center gap-1"><Target className="h-2.5 w-2.5" />{completed}/{habit.targetDays}</span>
                {pct >= 100 && <span className="inline-flex items-center gap-1 font-semibold text-success"><Flame className="h-2.5 w-2.5" />Maqsad!</span>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-base group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-7 w-7 rounded-lg",
                  habit.pinned && "text-primary hover:text-primary"
                )}
                onClick={onTogglePin}
                title={habit.pinned ? "Mahkamlanganini olib tashlash" : "Mahkamlash"}
              >
                {habit.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg disabled:opacity-30"
                onClick={onEdit}
                disabled={habit.pinned}
                title={habit.pinned ? "Mahkamlangan odatni tahrirlab bo'lmaydi" : "Tahrirlash"}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog open={confirm} onOpenChange={setConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                    disabled={habit.pinned}
                    title={habit.pinned ? "Mahkamlangan odatni o'chirib bo'lmaydi" : "O'chirish"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bu odatni o'chirishni xohlaysizmi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{habit.title}" va uning barcha kuzatuv tarixi butunlay o'chiriladi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      O'chirish
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="mt-1.5">
            <Progress value={pct} className="h-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
