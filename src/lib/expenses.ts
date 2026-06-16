import { apiPaginatedRequest, apiRequest } from "./api";
import { Expense } from "./types";

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
