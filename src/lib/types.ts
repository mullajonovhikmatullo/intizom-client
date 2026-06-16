export type HabitType = "good" | "bad";

export interface Habit {
  id: string;
  title: string;
  time?: string; // HH:mm — optional; if empty, no specific time
  type: HabitType;
  createdAt: string; // ISO date
  targetDays: number;
  pinned?: boolean;
}

// habitLogs: { [habitId]: { [YYYY-MM-DD]: boolean } }
export type HabitLogs = Record<string, Record<string, boolean>>;

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "education"
  | "other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string; // " so'm" | "$"
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Settings {
  theme: "light" | "dark";
  currency: string;
}

export type DebtDirection = "borrowed" | "lent";

export interface DebtPayment {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface Debt {
  id: string;
  direction: DebtDirection; // borrowed = men oldim, lent = men berdim
  person: string;
  amount: number;
  currency: string; // " so'm" | "$"
  dueDate?: string; // YYYY-MM-DD
  note?: string;
  isPaid: boolean;
  createdAt: string;
  payments?: DebtPayment[];
}

export interface LoanInstallment {
  id: string;
  index: number; // 1..totalMonths
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  paidDate?: string;
}

export interface Loan {
  id: string;
  title: string; // bank / loan name
  totalMonths: number;
  monthlyPayment: number;
  paymentDay: number; // 1..31
  currency: string;
  startDate: string; // YYYY-MM-DD (first installment month base)
  note?: string;
  installments: LoanInstallment[];
  createdAt: string;
}
