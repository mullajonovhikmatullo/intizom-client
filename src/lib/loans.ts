import { apiRequest } from "./api";
import { Loan, LoanInstallment } from "./types";

type LoanPayload = Omit<Loan, "id" | "createdAt" | "installments">;

export async function fetchLoans() {
  return apiRequest<Loan[]>("/loans", { method: "GET" });
}

export async function createLoan(data: LoanPayload) {
  return apiRequest<Loan>("/loans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLoan(id: string, data: LoanPayload) {
  return apiRequest<Loan>(`/loans/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      note: data.note || null,
    }),
  });
}

export async function deleteLoan(id: string) {
  await apiRequest<void>(`/loans/${id}`, { method: "DELETE" });
}

export async function setLoanInstallmentPaid(
  loanId: string,
  installmentId: string,
  paid: boolean,
  paidDate?: string,
) {
  return apiRequest<LoanInstallment>(`/loans/${loanId}/installments/${installmentId}`, {
    method: "PATCH",
    body: JSON.stringify({ paid, ...(paidDate ? { paidDate } : {}) }),
  });
}
