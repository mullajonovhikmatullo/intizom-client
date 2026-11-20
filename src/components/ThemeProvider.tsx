import { createContext, useContext, useEffect } from "react";
import { flushSync } from "react-dom";
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

  // Switch the whole page at once: per-element hover transitions are suspended so nothing
  // lags behind the background, and (where supported) old and new themes crossfade as one image.
  const changeTheme = (t: "light" | "dark") => {
    const root = document.documentElement;
    const swap = () => {
      root.classList.toggle("dark", t === "dark");
      // Commit React-driven theme output (icons, antd tokens) in the same frame.
      flushSync(() => setSettings((s) => ({ ...s, theme: t })));
    };

    root.classList.add("theme-switching");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof document.startViewTransition === "function" && !reduceMotion) {
      const transition = document.startViewTransition(swap);
      void transition.finished.finally(() => root.classList.remove("theme-switching"));
      return;
    }

    swap();
    // Re-enable transitions only after the new colors have been painted.
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  };

  const value: Ctx = {
    settings,
    setTheme: changeTheme,
    toggleTheme: () => changeTheme(settings.theme === "dark" ? "light" : "dark"),
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme outside provider");
  return ctx;
};
