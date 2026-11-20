import { useState } from "react";
import { ChartColumnBig, Moon, Sun, LogOut, User as UserIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "./ThemeProvider";
import { logout, useCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

interface Props {
  /** Page name, announced to screen readers only; the header shows just the logo. */
  title: string;
}

export function AppHeader({ title }: Props) {
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Hisobdan chiqildi");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl safe-top">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center">
          <BrandLogo />
          <h1 className="sr-only">{title}</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Mavzuni o'zgartirish" className="rounded-full">
            {settings.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-[9999px] pl-1 pr-2 py-1 outline-none transition-shadow duration-200 ease-out hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)] data-[state=open]:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.5),0_0_0_3px_hsl(var(--primary)/0.12)] dark:hover:shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.45)] dark:data-[state=open]:shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.6)] focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Foydalanuvchi menyusi"
                >
                  <UserAvatar user={user} className="h-8 w-8" fallbackClassName="text-xs" />
                  <span className="hidden sm:inline max-w-[120px] truncate text-sm font-medium">
                    {user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 duration-200 ease-out">
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
                <DropdownMenuItem onClick={() => navigate("/stats")}>
                  <ChartColumnBig className="mr-2 h-4 w-4" />
                  Statistika
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLogoutConfirmOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hisobdan chiqmoqchimisiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Qayta foydalanish uchun email va parolingiz bilan yana kirishingiz kerak bo'ladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Chiqish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
