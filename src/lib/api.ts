const DEFAULT_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "/api";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BASE_URL ?? DEFAULT_BASE_URL,
);
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY ?? "auth_token";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | { data: T } | null;

  if (!response.ok) {
    const error = (body as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "REQUEST_FAILED",
      error?.message ?? "Request failed",
      error?.details,
    );
  }

  return (body as { data: T }).data;
}

export async function apiPaginatedRequest<T>(path: string, limit = 200): Promise<T[]> {
  const requestPage = async (page: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${API_BASE_URL}${path}${separator}page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = (await response.json().catch(() => null)) as
      | ApiErrorBody
      | PaginatedResponse<T>
      | null;

    if (!response.ok) {
      const error = (body as ApiErrorBody | null)?.error;
      throw new ApiError(
        response.status,
        error?.code ?? "REQUEST_FAILED",
        error?.message ?? "Request failed",
        error?.details,
      );
    }

    return body as PaginatedResponse<T>;
  };

  const firstPage = await requestPage(1);
  const items = [...firstPage.data];
  const totalPages = Math.ceil(firstPage.meta.total / firstPage.meta.limit);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await requestPage(page);
    items.push(...response.data);
  }

  return items;
}
