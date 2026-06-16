import { Debt, DebtPayment } from "@/lib/types";
import { Pencil, Trash2, Check, Clock, FileText, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format, parseISO, isPast } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PaymentDialog } from "./PaymentDialog";

interface Props {
  debt: Debt;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
  onAddPayment: (payment: Omit<DebtPayment, "id">) => void;
}

export function DebtCard({ debt, onEdit, onDelete, onTogglePaid, onAddPayment }: Props) {
  const isUsd = debt.currency === "$";
  const [confirm, setConfirm] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const isOverdue = !debt.isPaid && debt.dueDate && isPast(parseISO(debt.dueDate));
  const isBorrowed = debt.direction === "borrowed";

  const payments = debt.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, debt.amount - paid);
  const progress = debt.amount > 0 ? Math.min(100, (paid / debt.amount) * 100) : 0;
  const hasPayments = payments.length > 0;

  const fmt = (val: number) =>
    isUsd ? `$${val.toFixed(2)}` : `${Math.round(val).toLocaleString()}${debt.currency}`;

  const amountColor = debt.isPaid
    ? "text-muted-foreground"
    : isBorrowed ? "text-destructive" : "text-success";

  return (
    <>
      <div className={cn(
        "group rounded-xl border bg-card px-3 py-2 shadow-sm transition-base hover:shadow-soft animate-fade-in",
        debt.isPaid ? "border-border/40 opacity-60" : isOverdue ? "border-destructive/40" : "border-border/70"
      )}>
        {/* Row 1: checkbox · name · actions */}
        <div className="flex items-center gap-2">
          {/* Checkbox */}
          <button
            onClick={onTogglePaid}
            aria-label={debt.isPaid ? "To'lanmagan deb belgilash" : "To'langan deb belgilash"}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-bounce tap-scale",
              debt.isPaid
                ? "border-success bg-success text-success-foreground"
                : isBorrowed
                ? "border-destructive/50 bg-background hover:border-destructive"
                : "border-success/50 bg-background hover:border-success"
            )}
          >
            {debt.isPaid && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </button>

          {/* Name — takes all remaining space */}
          <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
            {isBorrowed ? "📥 " : "📤 "}{debt.person}
          </p>

          {/* Actions — always visible, fixed right */}
          <div className="flex shrink-0 items-center gap-0 opacity-50 transition-base group-hover:opacity-100">
            {!debt.isPaid && (
              <Button
                size="icon" variant="ghost"
                className={cn("h-7 w-7 rounded-lg", isBorrowed ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10")}
                onClick={() => setPayOpen(true)}
                aria-label="To'lov qo'shish"
              >
                <CreditCard className="h-3.5 w-3.5" />
              </Button>
            )}
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
                  <AlertDialogTitle>Bu qarzni o'chirishni xohlaysizmi?</AlertDialogTitle>
                  <AlertDialogDescription>"{debt.person}" bilan bog'liq qarz butunlay o'chiriladi.</AlertDialogDescription>
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

        {/* Row 2: amount · meta — indented to align with name */}
        <div className="ml-10 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("min-w-0 break-all text-sm font-bold tabular-nums", amountColor, debt.isPaid && "line-through")}>
            {fmt(hasPayments && !debt.isPaid ? remaining : debt.amount)}
          </span>
          {hasPayments && !debt.isPaid && (
            <span className="min-w-0 break-all text-[11px] text-muted-foreground tabular-nums line-through">{fmt(debt.amount)}</span>
          )}
          {debt.dueDate && (
            <span className={cn("inline-flex min-w-0 items-center gap-1 text-[11px]", isOverdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
              <Clock className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">
                {format(parseISO(debt.dueDate), "dd.MM.yyyy")}
                {isOverdue && " · Muddati o'tdi!"}
              </span>
            </span>
          )}
          {debt.note && (
            <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-[11px] text-muted-foreground">
              <FileText className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{debt.note}</span>
            </span>
          )}
        </div>

        {/* Progress bar */}
        {hasPayments && (
          <div className="ml-10 mt-1.5 space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all duration-500", isBorrowed ? "bg-destructive/70" : "bg-success/70")}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn("h-3 w-3 transition-transform", historyOpen && "rotate-180")} />
                {payments.length} ta to'lov · {fmt(paid)} to'landi
              </button>
              <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Payment history */}
        {historyOpen && hasPayments && (
          <div className="ml-10 mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  {format(parseISO(p.date), "dd.MM.yyyy")}
                  {p.note && <span className="ml-1.5">· {p.note}</span>}
                </span>
                <span className={cn("font-semibold tabular-nums", isBorrowed ? "text-destructive" : "text-success")}>
                  -{fmt(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        debt={debt}
        remaining={remaining}
        onSave={onAddPayment}
      />
    </>
  );
}
