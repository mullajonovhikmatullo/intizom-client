import { Loan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, AlertTriangle, Calendar, ChevronDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  loan: Loan;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: (installmentId: string) => void;
}

export function LoanCard({ loan, onEdit, onDelete, onTogglePaid }: Props) {
  const isUsd = loan.currency === "$";
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);

  const fmt = (val: number) =>
    isUsd ? `$${val.toFixed(2)}` : `${Math.round(val).toLocaleString()}${loan.currency}`;

  const installments = loan.installments ?? [];
  const paidCount = installments.filter((i) => i.paid).length;
  const totalCount = loan.totalMonths;
  const total = totalCount * loan.monthlyPayment;
  const paidAmount = paidCount * loan.monthlyPayment;
  const remaining = Math.max(0, total - paidAmount);
  const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const fullyPaid = paidCount >= totalCount;

  // Next unpaid installment
  const nextUnpaid = installments.find((i) => !i.paid);
  const daysLeft = nextUnpaid ? differenceInCalendarDays(parseISO(nextUnpaid.dueDate), new Date()) : null;
  const isDueSoon = daysLeft !== null && daysLeft <= 1 && daysLeft >= 0;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div className={cn(
      "group rounded-xl border bg-card px-3 py-2 shadow-sm transition-base hover:shadow-soft animate-fade-in",
      fullyPaid ? "border-border/40 opacity-60"
        : isOverdue ? "border-destructive/40"
        : isDueSoon ? "border-warning/50"
        : "border-border/70"
    )}>
      {/* Row 1 */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{loan.title}</p>
          <p className="truncate text-[11px] text-muted-foreground leading-tight">
            {fmt(loan.monthlyPayment)} × {totalCount} oy · har oyning {loan.paymentDay}-kuni
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0 opacity-50 transition-base group-hover:opacity-100">
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog open={confirm} onOpenChange={setConfirm}>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Kreditni o'chirishni xohlaysizmi?</AlertDialogTitle>
                <AlertDialogDescription>"{loan.title}" kredit va barcha to'lov tarixi o'chiriladi.</AlertDialogDescription>
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

      {/* Row 2: badges + remaining */}
      <div className="ml-10 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={cn("text-sm font-bold tabular-nums", fullyPaid ? "text-muted-foreground line-through" : "text-foreground")}>
          {fmt(remaining)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">/ {fmt(total)}</span>

        {!fullyPaid && nextUnpaid && (
          <>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Muddati o'tdi ({Math.abs(daysLeft!)} kun)
              </span>
            )}
            {isDueSoon && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                <AlertTriangle className="h-3 w-3" />
                {daysLeft === 0 ? "Bugun to'lash kuni" : "1 kun qoldi"}
              </span>
            )}
            {!isOverdue && !isDueSoon && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-2.5 w-2.5" />
                Keyingi: {format(parseISO(nextUnpaid.dueDate), "dd.MM.yyyy")}
              </span>
            )}
          </>
        )}
      </div>

      {/* Progress */}
      <div className="ml-10 mt-1.5 space-y-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", fullyPaid ? "bg-success/70" : "bg-primary/70")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            {paidCount}/{totalCount} oy to'langan
          </button>
          <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Installments list */}
      {open && (
        <div className="ml-10 mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
          {installments.map((inst) => {
            const dl = differenceInCalendarDays(parseISO(inst.dueDate), new Date());
            const soon = !inst.paid && dl <= 1 && dl >= 0;
            const over = !inst.paid && dl < 0;
            return (
              <div key={inst.id} className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => onTogglePaid(inst.id)}
                  aria-label={inst.paid ? "To'lanmagan deb belgilash" : "To'langan deb belgilash"}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-bounce tap-scale",
                    inst.paid
                      ? "border-success bg-success text-success-foreground"
                      : over ? "border-destructive/60 bg-background hover:border-destructive"
                      : soon ? "border-warning/60 bg-background hover:border-warning"
                      : "border-border bg-background hover:border-foreground"
                  )}
                >
                  {inst.paid && <Check className="h-3 w-3" strokeWidth={3} />}
                </button>
                <span className="w-6 shrink-0 text-muted-foreground tabular-nums">#{inst.index}</span>
                <span className={cn(
                  "flex-1 tabular-nums",
                  inst.paid ? "text-muted-foreground line-through"
                    : over ? "font-semibold text-destructive"
                    : soon ? "font-semibold text-warning-foreground"
                    : "text-foreground"
                )}>
                  {format(parseISO(inst.dueDate), "dd.MM.yyyy")}
                </span>
                <span className={cn("font-semibold tabular-nums", inst.paid ? "text-muted-foreground" : "text-foreground")}>
                  {fmt(loan.monthlyPayment)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
