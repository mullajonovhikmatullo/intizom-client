import { NavLink } from "react-router-dom";
import { Home, Wallet, Banknote, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Odatlar", icon: Home, end: true },
  { to: "/expenses", label: "Xarajatlar", icon: Wallet },
  { to: "/todos", label: "Rejalar", icon: ListTodo },
  { to: "/debts", label: "Qarzlar", icon: Banknote },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl safe-bottom">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-base tap-scale",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-9 w-14 items-center justify-center rounded-full transition-base",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive && "animate-pop")} />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
