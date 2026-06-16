import { apiRequest } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

const AUTH_KEY = import.meta.env.VITE_AUTH_USER_KEY ?? "auth_user";
export const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY ?? "auth_token";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getCurrentUser() && getAuthToken());
}

export function saveAuthSession(session: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  saveUser(session.user);
}

export function updateUser(updates: Partial<Omit<User, "id">>): User | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updated: User = { ...current, ...updates };
  saveUser(updated);
  return updated;
}

export async function updateProfile(updates: Partial<Omit<User, "id">>): Promise<User> {
  const user = await apiRequest<User>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  saveUser(user);
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const session = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuthSession(session);
  return session.user;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const session = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  saveAuthSession(session);
  return session.user;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
