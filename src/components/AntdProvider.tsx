import { ConfigProvider, theme as antdTheme } from "antd";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

// Ensure every numeric input opens the numeric keyboard on mobile and
// blocks alphabetic characters at the browser level.
function useNumericInputEnforcement() {
  useEffect(() => {
    const apply = (el: HTMLInputElement) => {
      el.setAttribute("inputmode", "decimal");
      el.setAttribute("pattern", "[0-9.,]*");
      el.setAttribute("autocomplete", "off");
    };
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLInputElement>(
        ".ant-input-number-input, input[type='number']",
      ).forEach(apply);
    };
    scan(document);
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) scan(n as Element);
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
}

// Resolve an HSL CSS variable from :root into a usable color string for AntD.
function readVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useTheme();
  const isDark = settings.theme === "dark";
  useNumericInputEnforcement();

  // Read on each render so a theme toggle picks up new tokens.
  const primary = readVar("--primary", "hsl(250 75% 60%)");
  const success = readVar("--success", "hsl(158 70% 45%)");
  const warning = readVar("--warning", "hsl(38 95% 55%)");
  const danger = readVar("--destructive", "hsl(0 78% 60%)");
  const bg = readVar("--card", "hsl(0 0% 100%)");
  const text = readVar("--foreground", "hsl(240 15% 12%)");
  const border = readVar("--border", "hsl(240 15% 92%)");
  const muted = readVar("--muted-foreground", "hsl(240 8% 46%)");

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: primary,
          colorSuccess: success,
          colorWarning: warning,
          colorError: danger,
          colorBgContainer: bg,
          colorBgElevated: bg,
          colorBorder: border,
          colorBorderSecondary: border,
          borderRadius: 14,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Calendar: {
            fullBg: "transparent",
            fullPanelBg: "transparent",
            itemActiveBg: primary,
            colorBgContainer: "transparent",
          },
          Segmented: {
            colorBgLayout: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            colorBgElevated: bg,
            colorText: text,
            colorTextLabel: text,
          },
          DatePicker: {
            colorBgElevated: bg,
            colorBgContainer: bg,
            colorBorder: border,
          },
          InputNumber: {
            colorBgContainer: bg,
            colorBorder: border,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
