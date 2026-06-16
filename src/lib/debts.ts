import { apiRequest } from "./api";
import { Debt, DebtPayment } from "./types";

type DebtPayload = Omit<Debt, "id" | "createdAt" | "isPaid" | "payments">;
type DebtPaymentPayload = Omit<DebtPayment, "id">;

interface DebtPaymentResponse {
  payment: DebtPayment;
  debt: Debt;
}

export async function fetchDebts() {
  return apiRequest<Debt[]>("/debts", { method: "GET" });
}

export async function createDebt(data: DebtPayload) {
  return apiRequest<Debt>("/debts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDebt(id: string, data: DebtPayload) {
  return apiRequest<Debt>(`/debts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      dueDate: data.dueDate || null,
      note: data.note || null,
    }),
  });
}

export async function deleteDebt(id: string) {
  await apiRequest<void>(`/debts/${id}`, { method: "DELETE" });
}

export async function setDebtPaid(id: string, isPaid: boolean) {
  return apiRequest<Debt>(`/debts/${id}/paid`, {
    method: "PATCH",
    body: JSON.stringify({ isPaid }),
  });
}

export async function addDebtPayment(id: string, payment: DebtPaymentPayload) {
  return apiRequest<DebtPaymentResponse>(`/debts/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(payment),
  });
}
