import { apiPaginatedRequest, apiRequest } from "./api";
import { Expense, ExpenseBudget } from "./types";

type ExpensePayload = Omit<Expense, "id" | "createdAt">;

export async function fetchExpenses() {
  return apiPaginatedRequest<Expense>("/expenses");
}

export async function createExpense(data: ExpensePayload) {
  return apiRequest<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id: string, data: ExpensePayload) {
  return apiRequest<Expense>(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: string) {
  await apiRequest<void>(`/expenses/${id}`, { method: "DELETE" });
}

export async function fetchExpenseBudget() {
  return apiRequest<ExpenseBudget | null>("/expenses/budget", { method: "GET" });
}

export async function saveExpenseBudget(data: ExpenseBudget) {
  return apiRequest<ExpenseBudget>("/expenses/budget", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExpenseBudget() {
  await apiRequest<void>("/expenses/budget", { method: "DELETE" });
}
