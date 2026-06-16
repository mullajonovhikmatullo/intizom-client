import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AntdProvider } from "@/components/AntdProvider";
import AppLayout from "@/components/AppLayout";
import HabitsPage from "./pages/HabitsPage";
import ExpensesPage from "./pages/ExpensesPage";
import StatsPage from "./pages/StatsPage";
import DebtPage from "./pages/DebtPage";
import TodoPage from "./pages/TodoPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AntdProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<HabitsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/debts" element={<DebtPage />} />
              <Route path="/todos" element={<TodoPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AntdProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
