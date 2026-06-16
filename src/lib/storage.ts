import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset] as const;
}

export const STORAGE_KEYS = {
  habits: "ht.habits.v1",
  logs: "ht.habitLogs.v1",
  expenses: "ht.expenses.v1",
  settings: "ht.settings.v1",
  debts: "ht.debts.v1",
  loans: "ht.loans.v1",
} as const;
