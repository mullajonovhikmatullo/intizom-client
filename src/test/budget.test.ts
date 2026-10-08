import { describe, expect, it } from "vitest";
import { budgetProgress, monthlyFromWeekly } from "@/lib/budget";
import { Expense } from "@/lib/types";

const expense = (date: string, amount: number, currency = " so'm"): Expense => ({
  id: `${date}-${amount}`,
  title: "x",
  amount,
  currency,
  category: "food",
  date,
  createdAt: date,
});

// Wednesday, 2026-10-07 → 3rd day of the week (Mon 2026-10-05).
const now = new Date(2026, 9, 7, 12);
const budget = { weeklyAmount: 700_000, currency: " so'm" };

describe("budgetProgress", () => {
  it("derives daily and monthly goals from the weekly one", () => {
    const p = budgetProgress(budget, [], now);
    expect(p.daily).toBe(100_000);
    expect(p.monthly).toBe(3_100_000); // October has 31 days
    expect(monthlyFromWeekly(700_000, new Date(2026, 1, 1))).toBe(2_800_000);
    expect(p.daysLeftInWeek).toBe(4);
  });

  it("is on plan while spending stays under the pro-rated weekly goal", () => {
    const p = budgetProgress(budget, [expense("2026-10-05", 150_000), expense("2026-10-07", 100_000)], now);
    expect(p.weekSpent).toBe(250_000);
    expect(p.todaySpent).toBe(100_000);
    expect(p.status).toBe("ok");
  });

  it("flags spending ahead of plan and over the weekly goal", () => {
    expect(budgetProgress(budget, [expense("2026-10-06", 400_000)], now).status).toBe("ahead");
    expect(budgetProgress(budget, [expense("2026-10-06", 800_000)], now).status).toBe("over");
  });

  it("ignores other currencies and other weeks", () => {
    const p = budgetProgress(
      budget,
      [expense("2026-10-06", 50, "$"), expense("2026-10-04", 500_000), expense("2026-09-30", 1)],
      now
    );
    expect(p.weekSpent).toBe(0);
    expect(p.monthSpent).toBe(500_000);
  });
});
