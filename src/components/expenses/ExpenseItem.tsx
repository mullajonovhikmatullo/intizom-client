import { Expense } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";

interface Props {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: Props) {
  const isUsd = expense.currency === "$";
  const [confirm, setConfirm] = useState(false);
  const meta = categoryMeta(expense.category);
  const Icon = meta.icon;

  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-border/70 bg-card px-3 py-2 shadow-sm transition-base hover:shadow-soft animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">{expense.title}</div>
        <div className="text-[11px] text-muted-foreground">{format(parseISO(expense.date), "MMM d")}</div>
      </div>
      <div className="text-sm font-semibold tabular-nums">
        {isUsd ? `$${expense.amount.toFixed(2)}` : `${Math.round(expense.amount).toLocaleString()}${expense.currency}`}
      </div>
      <div className="flex items-center gap-0 opacity-50 transition-base group-hover:opacity-100">
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
              <AlertDialogTitle>Bu xarajatni o'chirishni xohlaysizmi?</AlertDialogTitle>
              <AlertDialogDescription>"{expense.title}" o'chiriladi.</AlertDialogDescription>
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
  );
}
