import { Navigate, Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { isAuthenticated } from "@/lib/auth";

export default function AppLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-full bg-background">
      <main className="mx-auto max-w-2xl pb-44 pt-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
