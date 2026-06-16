import { Moon, Sun, Download, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { getCurrentUser, logout } from "@/lib/auth";
import { toast } from "sonner";
import { fetchHabitLogs, fetchHabits } from "@/lib/habits";
import { fetchExpenses } from "@/lib/expenses";

interface Props {
  title: string;
  subtitle?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader({ title, subtitle }: Props) {
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    toast.success("Hisobdan chiqildi");
    navigate("/login", { replace: true });
  };

  const exportData = async () => {
    try {
      const [habits, habitLogs, expenses] = await Promise.all([
        fetchHabits(),
        fetchHabitLogs(),
        fetchExpenses(),
      ]);
      const data = {
        habits,
        habitLogs,
        expenses,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ma'lumotlar eksport qilindi");
    } catch {
      toast.error("Eksport muvaffaqiyatsiz");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl safe-top">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent shrink-0">
            Intizom
          </span>
          <div className="min-w-0 border-l border-border/60 pl-3">
            <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" onClick={exportData} aria-label="Ma'lumotlarni eksport qilish" className="rounded-full">
            <Download className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Mavzuni o'zgartirish" className="rounded-full">
            {settings.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent transition-base tap-scale"
                  aria-label="Foydalanuvchi menyusi"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline max-w-[120px] truncate text-sm font-medium">
                    {user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-semibold">{user.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
