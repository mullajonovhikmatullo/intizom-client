import { apiPaginatedRequest, apiRequest } from "./api";

export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  title: string;
  note?: string;
  priority: TodoPriority;
  dueDate?: string;
  isDone: boolean;
  createdAt: string;
  completedAt?: string;
}

type TodoPayload = Omit<Todo, "id" | "createdAt" | "isDone" | "completedAt">;

export async function fetchTodos() {
  return apiPaginatedRequest<Todo>("/todos");
}

export async function createTodo(data: TodoPayload) {
  return apiRequest<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTodo(id: string, data: TodoPayload) {
  return apiRequest<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      note: data.note || null,
      dueDate: data.dueDate || null,
    }),
  });
}

export async function deleteTodo(id: string) {
  await apiRequest<void>(`/todos/${id}`, { method: "DELETE" });
}

export async function setTodoDone(id: string, isDone: boolean) {
  return apiRequest<Todo>(`/todos/${id}/done`, {
    method: "PATCH",
    body: JSON.stringify({ isDone }),
  });
}
