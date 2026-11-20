import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      boxShadow: {
        // Theme-driven: plain soft shadow in light mode, neumorphic in dark mode.
        sm: "var(--shadow-raised)",
        inset: "var(--shadow-inset)",
        tab: "var(--shadow-tab)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Every element that is rounded uses a single 0.5rem radius.
      // For a deliberate exception use an arbitrary value, e.g. rounded-[9999px].
      borderRadius: {
        sm: "var(--radius)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
        "3xl": "var(--radius)",
        full: "var(--radius)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        // Only the start frame is given so the animation ends on the element's own
        // opacity/transform (e.g. opacity-60) instead of snapping to it afterwards.
        "fade-in": { "0%": { opacity: "0", transform: "translateY(8px)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.96)" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(16px)" } },
        "pop": { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
        // Modal open/close: backdrop and panel share duration and easing so they move as one.
        // On open the panel turns opaque early, so the page behind never shows through it;
        // on close panel and backdrop hold, then dissolve together. Motion spans the full duration.
        "overlay-in": { from: { opacity: "0" } },
        "overlay-out": { "30%": { opacity: "1" }, "100%": { opacity: "0" } },
        "dialog-in": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.96)" },
          "18%": { opacity: "1" },
        },
        "dialog-out": {
          "30%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(10px) scale(0.97)" },
        },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "pop": "pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "overlay-in": "overlay-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "overlay-out": "overlay-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "dialog-in": "dialog-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "dialog-out": "dialog-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
