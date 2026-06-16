import { createContext, useContext, useEffect } from "react";
import { useLocalStorage, STORAGE_KEYS } from "@/lib/storage";
import { Settings } from "@/lib/types";

type Ctx = {
  settings: Settings;
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, {
    theme: "light",
    currency: " so'm",
  });

  useEffect(() => {
    if (settings.currency === "$") {
      setSettings((s) => ({ ...s, currency: " so'm" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.theme]);

  const applyTheme = (t: "light" | "dark") => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  };

  const value: Ctx = {
    settings,
    setTheme: (t) => {
      applyTheme(t);
      setSettings((s) => ({ ...s, theme: t }));
    },
    toggleTheme: () => {
      const next = settings.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      setSettings((s) => ({ ...s, theme: next }));
    },
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme outside provider");
  return ctx;
};
