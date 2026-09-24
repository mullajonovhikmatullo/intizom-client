import { useLayoutEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Banknote, Home, ListTodo, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { requestCreateItem } from "@/lib/ui-events";
import { BOTTOM_NAV_HEIGHT, createBottomNavPath } from "@/lib/bottom-nav-shape";

const items = [
  { to: "/", label: "Odatlar", icon: Home, end: true, column: "col-start-1" },
  { to: "/expenses", label: "Xarajatlar", icon: Wallet, column: "col-start-2" },
  { to: "/todos", label: "Rejalar", icon: ListTodo, column: "col-start-4" },
  { to: "/debts", label: "Qarzlar", icon: Banknote, column: "col-start-5" },
];

export function BottomNav() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [surfaceWidth, setSurfaceWidth] = useState(576);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const updateWidth = () => {
      const { width, height } = surface.getBoundingClientRect();
      if (height > 0) setSurfaceWidth(width * BOTTOM_NAV_HEIGHT / height);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 px-3"
    >
      <div ref={surfaceRef} className="relative mx-auto h-[5.25rem] max-w-xl">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${surfaceWidth} ${BOTTOM_NAV_HEIGHT}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-card drop-shadow-[0_4px_12px_hsl(240_15%_12%/0.12)] dark:drop-shadow-[0_4px_12px_hsl(0_0%_0%/0.5)]"
        >
          <path d={createBottomNavPath(surfaceWidth)} fill="currentColor" />
        </svg>

        <ul className="relative grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5.5rem_minmax(0,1fr)_minmax(0,1fr)] items-stretch px-1.5">
          {items.map(({ to, label, icon: Icon, end, column }) => (
            <li key={to} className={column}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "pointer-events-auto flex h-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-0.5 pt-1 text-[10px] font-semibold transition-base tap-scale focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:px-1 sm:text-xs",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-12 items-center justify-center rounded-2xl transition-base",
                        isActive && "bg-primary/10 shadow-sm"
                      )}
                    >
                      <Icon
                        className={cn("h-[1.35rem] w-[1.35rem]", isActive && "animate-pop")}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </span>
                    <span className="max-w-full truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={requestCreateItem}
          className="pointer-events-auto absolute left-1/2 top-4 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-[0_3px_8px_hsl(var(--primary)/0.2)] transition-bounce tap-scale hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Yangi ma'lumot qo'shish"
        >
          <Plus className="h-7 w-7" strokeWidth={2.75} />
        </button>
      </div>
    </nav>
  );
}
