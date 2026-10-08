import { endOfWeek, getDate, getDaysInMonth, startOfMonth, startOfWeek } from "date-fns";
import { dateKey } from "./date";
import { Expense, ExpenseBudget } from "./types";

export type BudgetStatus = "ok" | "ahead" | "over";

export interface BudgetProgress {
  daily: number;
  weekly: number;
  monthly: number;
  todaySpent: number;
  weekSpent: number;
  monthSpent: number;
  /** How much the plan allows to have been spent this week up to and including today. */
  weekPlanToDate: number;
  monthPlanToDate: number;
  daysLeftInWeek: number; // after today
  status: BudgetStatus;
}

export function formatMoney(amount: number, currency: string) {
  return currency === "$"
    ? `$${Math.round(amount).toLocaleString()}`
    : `${Math.round(amount).toLocaleString()}${currency}`;
}

/** Monthly goal derived from the weekly one: weekly / 7 × days in the month. */
export function monthlyFromWeekly(weekly: number, d = new Date()) {
  return (weekly / 7) * getDaysInMonth(d);
}

export function budgetProgress(budget: ExpenseBudget, expenses: Expense[], now = new Date()): BudgetProgress {
  const weekly = budget.weeklyAmount;
  const daily = weekly / 7;
  const monthly = monthlyFromWeekly(weekly, now);

  const today = dateKey(now);
  const weekFrom = dateKey(startOfWeek(now, { weekStartsOn: 1 }));
  const weekTo = dateKey(endOfWeek(now, { weekStartsOn: 1 }));
  const monthFrom = dateKey(startOfMonth(now));

  let todaySpent = 0;
  let weekSpent = 0;
  let monthSpent = 0;
  expenses.forEach((e) => {
    if ((e.currency ?? " so'm") !== budget.currency) return;
    if (e.date === today) todaySpent += e.amount;
    if (e.date >= weekFrom && e.date <= weekTo) weekSpent += e.amount;
    if (e.date >= monthFrom && e.date <= today) monthSpent += e.amount;
  });

  const dayOfWeek = ((now.getDay() + 6) % 7) + 1; // Mon = 1 … Sun = 7
  const weekPlanToDate = daily * dayOfWeek;
  const monthPlanToDate = daily * getDate(now);

  const status: BudgetStatus =
    weekSpent > weekly ? "over" : weekSpent > weekPlanToDate ? "ahead" : "ok";

  return {
    daily,
    weekly,
    monthly,
    todaySpent,
    weekSpent,
    monthSpent,
    weekPlanToDate,
    monthPlanToDate,
    daysLeftInWeek: 7 - dayOfWeek,
    status,
  };
}
