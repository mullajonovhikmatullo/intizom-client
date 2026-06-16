import { ExpenseCategory } from "./types";
import { LucideIcon, UtensilsCrossed, Car, ShoppingBag, Receipt, Film, HeartPulse, GraduationCap, Package } from "lucide-react";

export const CATEGORIES: { value: ExpenseCategory; label: string; icon: LucideIcon; color: string }[] = [
  { value: "food", label: "Oziq-ovqat", icon: UtensilsCrossed, color: "hsl(var(--chart-3))" },
  { value: "transport", label: "Transport", icon: Car, color: "hsl(var(--chart-5))" },
  { value: "shopping", label: "Xarid", icon: ShoppingBag, color: "hsl(var(--chart-6))" },
  { value: "bills", label: "To'lovlar", icon: Receipt, color: "hsl(var(--chart-1))" },
  { value: "entertainment", label: "Ko'ngil ochar", icon: Film, color: "hsl(var(--chart-4))" },
  { value: "health", label: "Salomatlik", icon: HeartPulse, color: "hsl(var(--chart-2))" },
  { value: "education", label: "Ta'lim", icon: GraduationCap, color: "hsl(var(--chart-7, var(--chart-1)))" },
  { value: "other", label: "Boshqa", icon: Package, color: "hsl(var(--muted-foreground))" },
];

export const categoryMeta = (c: ExpenseCategory) =>
  CATEGORIES.find((x) => x.value === c) ?? CATEGORIES[CATEGORIES.length - 1];
